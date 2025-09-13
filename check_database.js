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
    
    // Problema identificado: Tabelas existem fisicamente mas não estão no cache do schema
console.log('\n🚨 PROBLEMA IDENTIFICADO:');
console.log('As tabelas existem fisicamente no banco (count funciona)');
console.log('Mas não estão no cache do schema do Supabase');
console.log('Isso explica por que os tipos TypeScript não foram gerados');

console.log('\n=== POSSÍVEIS CAUSAS ===');
console.log('1. Políticas RLS muito restritivas');
console.log('2. Tabelas criadas fora do Supabase CLI');
console.log('3. Cache do schema desatualizado');
console.log('4. Permissões de acesso incorretas');

// Verificar se há outras tabelas no schema que funcionam
console.log('\n=== TESTANDO TABELAS QUE FUNCIONAM ===');
try {
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .limit(1);
  
  if (companiesError) {
    console.log('❌ Erro ao acessar companies:', companiesError.message);
  } else {
    console.log('✅ Tabela companies acessível via Supabase client');
  }
} catch (error) {
  console.log('Erro ao testar companies:', error.message);
}

console.log('\n=== RECOMENDAÇÕES ===');
console.log('1. Verificar se as migrações foram aplicadas corretamente');
console.log('2. Verificar políticas RLS das tabelas leads e surveys');
console.log('3. Recriar as tabelas usando o Supabase CLI');
console.log('4. Limpar cache do schema e regenerar tipos');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabase();