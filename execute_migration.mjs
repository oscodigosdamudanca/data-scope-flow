// Script para executar a migração SQL diretamente
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Caminho para o arquivo de migração
const migrationFilePath = path.join(process.cwd(), 'supabase', 'migrations', '20250916000000_create_missing_tables.sql');

async function executeMigration() {
  console.log('🚀 Iniciando execução da migração SQL...');
  
  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
    console.log(`📄 Arquivo de migração carregado: ${migrationFilePath}`);
    
    // Dividir o conteúdo em comandos SQL individuais
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`🔢 Total de comandos SQL a executar: ${sqlCommands.length}`);
    
    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      try {
        console.log(`⏳ Executando comando ${i + 1}/${sqlCommands.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' });
        
        if (error) {
          console.error(`❌ Erro ao executar comando ${i + 1}: ${error.message}`);
          // Continuar com o próximo comando mesmo em caso de erro
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`❌ Exceção ao executar comando ${i + 1}: ${cmdError.message}`);
        // Continuar com o próximo comando mesmo em caso de erro
      }
    }
    
    console.log('🎉 Migração concluída!');
    
    // Verificar se as tabelas foram criadas
    console.log('\n📋 Verificando tabelas criadas...');
    await verifyTables(['raffles', 'raffle_participants', 'leads']);
    
  } catch (error) {
    console.error(`❌ Erro durante a migração: ${error.message}`);
    process.exit(1);
  }
}

async function verifyTables(tableNames) {
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Tabela '${tableName}' não acessível: ${error.message}`);
      } else {
        console.log(`✅ Tabela '${tableName}' criada com sucesso`);
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar tabela '${tableName}': ${error.message}`);
    }
  }
}

// Executar a migração
executeMigration();