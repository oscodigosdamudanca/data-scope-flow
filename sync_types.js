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

// Função para gerar tipos básicos para tabelas conhecidas
async function generateBasicTypes(tableNames) {
  console.log('Gerando tipos básicos para tabelas conhecidas...');
  
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

  // Adiciona definições básicas para cada tabela
  for (const tableName of tableNames) {
    typesContent += `      ${tableName}: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          [key: string]: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          [key: string]: any
        }
        Relationships: []
      }
`;
  }

  typesContent += `    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
      company_role: "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
  ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
  : never
`;

  // Salva o arquivo
  const outputPath = './src/integrations/supabase/types.ts';
  fs.writeFileSync(outputPath, typesContent);
  console.log(`✅ Tipos básicos gerados com sucesso em: ${outputPath}`);
}

// Função para gerar tipos TypeScript
async function generateTypes() {
  try {
    console.log('Gerando tipos TypeScript a partir do banco de dados...');
    
    // Obtém metadados das tabelas usando information_schema
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_info');
    
    if (tablesError) {
      console.log('Tentando abordagem alternativa para obter informações das tabelas...');
      
      // Abordagem alternativa: usar SQL direto
      const { data: tablesAlt, error: tablesAltError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
      
      if (tablesAltError) {
        console.log('Usando lista de tabelas conhecidas...');
        // Lista de tabelas conhecidas baseada na estrutura atual
        const knownTables = [
          'companies', 'leads', 'surveys', 'survey_questions', 'survey_responses',
          'company_memberships', 'profiles', 'raffles', 'raffle_prizes', 
          'raffle_participants', 'user_roles', 'notifications', 'notification_settings',
          'bi_configs', 'follow_up_rules'
        ];
        
        // Gera tipos básicos para as tabelas conhecidas
        await generateBasicTypes(knownTables);
        return;
      }
    }
    
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