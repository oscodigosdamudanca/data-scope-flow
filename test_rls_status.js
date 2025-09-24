/**
 * =====================================================
 * TESTE SIMPLES DE STATUS RLS
 * =====================================================
 * 
 * Script para verificar rapidamente o status do RLS
 * nas tabelas principais do sistema.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '❌');
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? '✓' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tabelas principais para testar
const MAIN_TABLES = [
  'profiles',
  'companies', 
  'company_memberships',
  'leads',
  'surveys',
  'survey_questions',
  'survey_responses',
  'user_roles'
];

async function testTableAccess(tableName) {
  console.log(`\n🔍 Testando acesso à tabela: ${tableName}`);
  
  try {
    // Tentar acessar a tabela sem autenticação
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
        console.log(`✅ ${tableName}: RLS ATIVO - Acesso negado sem autenticação`);
        return { table: tableName, status: 'RLS_ACTIVE', secure: true };
      } else {
        console.log(`⚠️  ${tableName}: Erro inesperado - ${error.message}`);
        return { table: tableName, status: 'ERROR', secure: false, error: error.message };
      }
    } else {
      console.log(`❌ ${tableName}: RLS INATIVO - Acesso permitido sem autenticação (${data?.length || 0} registros)`);
      return { table: tableName, status: 'RLS_INACTIVE', secure: false, records: data?.length || 0 };
    }
  } catch (err) {
    console.log(`💥 ${tableName}: Erro de conexão - ${err.message}`);
    return { table: tableName, status: 'CONNECTION_ERROR', secure: false, error: err.message };
  }
}

async function runRLSStatusTest() {
  console.log('🚀 Iniciando teste de status RLS...\n');
  console.log('📊 Testando acesso às tabelas principais sem autenticação...');
  
  const results = [];
  
  for (const table of MAIN_TABLES) {
    const result = await testTableAccess(table);
    results.push(result);
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo dos resultados
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMO DOS TESTES RLS');
  console.log('='.repeat(60));
  
  const secure = results.filter(r => r.secure);
  const insecure = results.filter(r => !r.secure);
  
  console.log(`✅ Tabelas seguras (RLS ativo): ${secure.length}`);
  console.log(`❌ Tabelas inseguras (RLS inativo): ${insecure.length}`);
  
  if (insecure.length > 0) {
    console.log('\n⚠️  TABELAS QUE PRECISAM DE CORREÇÃO:');
    insecure.forEach(result => {
      console.log(`   - ${result.table}: ${result.status}`);
    });
    
    console.log('\n🔧 AÇÃO NECESSÁRIA:');
    console.log('   Execute o script SQL manual no Supabase Dashboard:');
    console.log('   📁 Arquivo: rls_fix_manual.sql');
    console.log('   🌐 Dashboard: https://supabase.com/dashboard/project/[PROJECT_ID]/sql');
  } else {
    console.log('\n🎉 Todas as tabelas estão seguras!');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Executar o teste
runRLSStatusTest().catch(console.error);