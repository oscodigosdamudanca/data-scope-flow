// Script temporário para verificar a estrutura do banco de dados
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://bhjreswsrfvnzyvmxtwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoanJlc3dzcmZ2bnp5dm14dHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU5NTQsImV4cCI6MjA3MzAzMTk1NH0.GR-Paj9yMYnTIhwLISBuG_ycwg1Bz9Vd3bEMChuEUGM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco de dados...');
  
  try {
    // Verificar tabelas principais
    const tables = ['companies', 'profiles', 'user_roles', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses'];
    
    for (const table of tables) {
      console.log(`\n📋 Verificando tabela: ${table}`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Erro ao acessar ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} existe - ${count || 0} registros`);
      }
    }
    
    // 🔍 VERIFICAÇÃO FINAL: Testando se as tabelas leads e surveys realmente existem
console.log('\n=== TESTE DIRETO DE EXISTÊNCIA DAS TABELAS ===');

// Teste 1: Verificar se conseguimos fazer SELECT nas tabelas
try {
  console.log('\n📋 Testando SELECT em leads...');
  const { data: leadsTest, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  
  if (leadsError) {
    console.log('❌ Erro ao acessar leads:', leadsError.message);
    console.log('🔍 Código do erro:', leadsError.code);
  } else {
    console.log('✅ Tabela leads acessível via Supabase client');
    console.log('📊 Dados encontrados:', leadsTest?.length || 0);
  }
} catch (error) {
  console.log('💥 Erro inesperado ao testar leads:', error.message);
}

try {
  console.log('\n📋 Testando SELECT em surveys...');
  const { data: surveysTest, error: surveysError } = await supabase
    .from('surveys')
    .select('*')
    .limit(1);
  
  if (surveysError) {
    console.log('❌ Erro ao acessar surveys:', surveysError.message);
    console.log('🔍 Código do erro:', surveysError.code);
  } else {
    console.log('✅ Tabela surveys acessível via Supabase client');
    console.log('📊 Dados encontrados:', surveysTest?.length || 0);
  }
} catch (error) {
  console.log('💥 Erro inesperado ao testar surveys:', error.message);
}

// Teste 2: Comparar com uma tabela que sabemos que funciona
console.log('\n=== COMPARAÇÃO COM TABELA COMPANIES (CONTROLE) ===');
const { data: companiesData, error: companiesError } = await supabase
  .from('companies')
  .select('*')
  .limit(1);

if (companiesError) {
  console.log('❌ Erro ao acessar companies:', companiesError.message);
} else {
  console.log('✅ Tabela companies acessível normalmente');
  console.log('📊 Dados encontrados:', companiesData?.length || 0);
}

// 📋 CONCLUSÃO:
console.log('\n=== CONCLUSÃO ===');
console.log('Se leads/surveys retornarem erro "relation does not exist",');
console.log('significa que as tabelas foram removidas e nunca recriadas.');
console.log('Se retornarem dados ou erro de permissão, existem mas têm problemas de acesso.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabase();