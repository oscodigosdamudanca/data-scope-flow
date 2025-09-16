// Script para sincronizar tipos TypeScript com o Supabase
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateTypes() {
  try {
    console.log('Gerando tipos TypeScript a partir do esquema do Supabase...');
    
    // Obtém as definições de tabelas
    const { data: tables, error: tablesError } = await supabase.from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      throw new Error(`Erro ao obter tabelas: ${tablesError.message}`);
    }
    
    let typesContent = `// Tipos gerados automaticamente a partir do esquema do Supabase
// Não edite este arquivo manualmente

export type Tables = {
`;

    // Processa cada tabela
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Obtém as colunas da tabela
      const { data: columns, error: columnsError } = await supabase
        .from('pg_attribute')
        .select(`
          attname,
          pg_type.typname
        `)
        .eq('attrelid', `public.${tableName}::regclass`)
        .gt('attnum', 0)
        .join('pg_type', 'pg_attribute.atttypid', 'pg_type.oid');
      
      if (columnsError) {
        console.warn(`Aviso: Não foi possível obter colunas para ${tableName}: ${columnsError.message}`);
        continue;
      }
      
      typesContent += `  ${tableName}: {
`;
      
      // Adiciona cada coluna
      for (const column of columns) {
        let tsType = 'any';
        
        // Mapeia tipos PostgreSQL para TypeScript
        switch (column.typname) {
          case 'int4':
          case 'int8':
          case 'float4':
          case 'float8':
          case 'numeric':
            tsType = 'number';
            break;
          case 'bool':
            tsType = 'boolean';
            break;
          case 'text':
          case 'varchar':
          case 'char':
          case 'name':
            tsType = 'string';
            break;
          case 'timestamp':
          case 'timestamptz':
          case 'date':
            tsType = 'string'; // ou Date
            break;
          case 'json':
          case 'jsonb':
            tsType = 'Record<string, any>';
            break;
          case 'uuid':
            tsType = 'string';
            break;
          default:
            tsType = 'any';
        }
        
        typesContent += `    ${column.attname}: ${tsType};\n`;
      }
      
      typesContent += `  };\n`;
    }
    
    typesContent += `};\n`;
    
    // Escreve o arquivo de tipos
    const typesPath = resolve('./src/types/database.types.ts');
    writeFileSync(typesPath, typesContent);
    
    console.log(`Tipos TypeScript gerados com sucesso em ${typesPath}`);
  } catch (error) {
    console.error('Erro ao gerar tipos:', error);
    process.exit(1);
  }
}

// Executa a função principal
generateTypes();