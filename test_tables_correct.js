import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Obtém as credenciais do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verifica se as credenciais estão disponíveis
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no arquivo .env');
  process.exit(1);
}

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com o Supabase...\n');
  
  try {
    // Tabelas que realmente existem no banco baseado na verificação MCP
    const existingTables = [
      'companies',
      'company_memberships', 
      'leads',
      'surveys',
      'survey_questions',
      'survey_responses',
      'user_roles'
    ];
    
    console.log('📋 Verificando tabelas existentes:\n');
    
    for (const table of existingTables) {
      try {
        console.log(`Verificando tabela '${table}'...`);
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Erro ao acessar '${table}': ${error.message}`);
        } else {
          console.log(`✅ Tabela '${table}' acessível. Registros encontrados: ${data.length}`);
        }
      } catch (err) {
        console.log(`❌ Erro inesperado ao verificar '${table}': ${err.message}`);
      }
    }
    
    console.log('\n🔗 Testando relacionamentos...');
    
    // Testa relacionamento companies -> surveys
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          surveys (
            id,
            title
          )
        `)
        .limit(1);
        
      if (!companiesError) {
        console.log('✅ Relacionamento companies -> surveys funcionando');
      } else {
        console.log(`❌ Erro no relacionamento companies -> surveys: ${companiesError.message}`);
      }
    } catch (err) {
      console.log(`❌ Erro ao testar relacionamentos: ${err.message}`);
    }
    
    console.log('\n🔐 Verificando RLS (Row Level Security)...');
    
    // Verifica se RLS está habilitado nas tabelas principais
    for (const table of ['companies', 'leads', 'surveys']) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
          
        if (error && error.message.includes('RLS')) {
          console.log(`✅ RLS ativo na tabela '${table}' (acesso negado sem autenticação)`);
        } else if (!error) {
          console.log(`⚠️ Tabela '${table}' acessível sem autenticação (RLS pode estar desabilitado)`);
        } else {
          console.log(`❓ Status RLS incerto para '${table}': ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar RLS em '${table}': ${err.message}`);
      }
    }
    
    console.log('\n✅ Verificação completa!');
    
  } catch (error) {
    console.error('❌ Erro geral ao testar conexão:', error.message);
  }
}

testSupabaseConnection();