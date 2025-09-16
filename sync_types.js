// Script para sincronizar tipos TypeScript com o banco de dados
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verifica se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não definidas');
  console.log('Por favor, crie um arquivo .env com as configurações necessárias');
  process.exit(1);
}

// Cria cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar tipos TypeScript
async function generateTypes() {
  try {
    console.log('Gerando tipos TypeScript a partir do banco de dados...');
    
    // Obtém metadados das tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (tablesError) throw new Error(`Erro ao obter tabelas: ${tablesError.message}`);
    
    // Gera tipos TypeScript
    let typesContent = `// Tipos gerados automaticamente a partir do banco de dados
// Gerado em: ${new Date().toISOString()}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`;

    // Adiciona definição para cada tabela
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Obtém colunas da tabela
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.warn(`Aviso: Não foi possível obter colunas para ${tableName}: ${columnsError.message}`);
        continue;
      }
      
      typesContent += `      ${tableName}: {\n`;
      typesContent += `        Row: {\n`;
      
      // Adiciona cada coluna
      for (const column of columns) {
        const columnName = column.column_name;
        const dataType = mapPostgresTypeToTypeScript(column.data_type, column.udt_name);
        const isNullable = column.is_nullable === 'YES' ? ' | null' : '';
        
        typesContent += `          ${columnName}: ${dataType}${isNullable}\n`;
      }
      
      typesContent += `        }\n`;
      typesContent += `        Insert: {\n`;
      
      // Adiciona definição de Insert
      for (const column of columns) {
        const columnName = column.column_name;
        const dataType = mapPostgresTypeToTypeScript(column.data_type, column.udt_name);
        const isNullable = column.is_nullable === 'YES' ? ' | null' : '';
        const hasDefault = column.column_default !== null;
        
        if (hasDefault) {
          typesContent += `          ${columnName}?: ${dataType}${isNullable}\n`;
        } else {
          typesContent += `          ${columnName}: ${dataType}${isNullable}\n`;
        }
      }
      
      typesContent += `        }\n`;
      typesContent += `        Update: {\n`;
      
      // Adiciona definição de Update
      for (const column of columns) {
        const columnName = column.column_name;
        const dataType = mapPostgresTypeToTypeScript(column.data_type, column.udt_name);
        const isNullable = column.is_nullable === 'YES' ? ' | null' : '';
        
        typesContent += `          ${columnName}?: ${dataType}${isNullable}\n`;
      }
      
      typesContent += `        }\n`;
      typesContent += `      }\n`;
    }
    
    typesContent += `    }\n`;
    typesContent += `  }\n`;
    typesContent += `}\n`;
    
    // Escreve o arquivo de tipos
    fs.writeFileSync('database_synced.types.ts', typesContent);
    console.log('Tipos TypeScript gerados com sucesso em database_synced.types.ts');
  } catch (error) {
    console.error(`Erro ao gerar tipos: ${error.message}`);
    process.exit(1);
  }
}

// Mapeia tipos PostgreSQL para TypeScript
function mapPostgresTypeToTypeScript(pgType, udtName) {
  switch (pgType.toLowerCase()) {
    case 'integer':
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'double precision':
    case 'smallint':
    case 'bigint':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'json':
    case 'jsonb':
      return 'Json';
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date':
    case 'time':
      return 'string';
    case 'uuid':
      return 'string';
    case 'USER-DEFINED':
      return 'string'; // Enums são tratados como strings
    default:
      return 'string';
  }
}

// Executa a geração de tipos
generateTypes();