/**
 * Script para testar a conectividade com o banco de dados após configuração manual
 * Execute: node test_database_connection.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Testa a conectividade básica com o Supabase
 */
async function testConnection() {
  console.log('🔗 Testando conectividade com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conectividade:', error.message);
      return false;
    }
    
    console.log('✅ Conectividade OK');
    return true;
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return false;
  }
}

/**
 * Verifica se todas as tabelas necessárias existem
 */
async function checkTables() {
  console.log('\n📋 Verificando existência das tabelas...');
  
  const tables = ['leads', 'surveys', 'survey_questions', 'survey_responses'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
        results[table] = false;
      } else {
        console.log(`✅ Tabela '${table}': OK`);
        results[table] = true;
      }
    } catch (err) {
      console.log(`❌ Tabela '${table}': ${err.message}`);
      results[table] = false;
    }
  }
  
  return results;
}

/**
 * Testa operações CRUD básicas
 */
async function testCRUDOperations() {
  console.log('\n🔧 Testando operações CRUD...');
  
  try {
    // Teste de INSERT
    const testLead = {
      name: 'Teste Lead',
      email: `teste_${Date.now()}@example.com`,
      phone: '(11) 99999-9999',
      status: 'new'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert([testLead])
      .select();
    
    if (insertError) {
      console.log('❌ INSERT falhou:', insertError.message);
      return false;
    }
    
    console.log('✅ INSERT: OK');
    const leadId = insertData[0].id;
    
    // Teste de SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (selectError) {
      console.log('❌ SELECT falhou:', selectError.message);
      return false;
    }
    
    console.log('✅ SELECT: OK');
    
    // Teste de UPDATE
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', leadId);
    
    if (updateError) {
      console.log('❌ UPDATE falhou:', updateError.message);
      return false;
    }
    
    console.log('✅ UPDATE: OK');
    
    // Teste de DELETE
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);
    
    if (deleteError) {
      console.log('❌ DELETE falhou:', deleteError.message);
      return false;
    }
    
    console.log('✅ DELETE: OK');
    return true;
    
  } catch (err) {
    console.error('❌ Erro nas operações CRUD:', err.message);
    return false;
  }
}

/**
 * Testa as políticas RLS
 */
async function testRLSPolicies() {
  console.log('\n🔒 Testando políticas RLS...');
  
  try {
    // Tenta acessar dados sem autenticação (deve funcionar com políticas públicas)
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, email')
      .limit(1);
    
    if (error) {
      console.log('❌ RLS pode estar muito restritivo:', error.message);
      return false;
    }
    
    console.log('✅ RLS: Políticas configuradas corretamente');
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar RLS:', err.message);
    return false;
  }
}

/**
 * Verifica dados de exemplo
 */
async function checkSampleData() {
  console.log('\n📊 Verificando dados de exemplo...');
  
  const tables = ['leads', 'surveys'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        console.log(`❌ Erro ao verificar ${table}:`, error.message);
        continue;
      }
      
      console.log(`📋 Tabela '${table}': ${count || 0} registros`);
      if (data && data.length > 0) {
        console.log(`   Exemplo:`, JSON.stringify(data[0], null, 2));
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar ${table}:`, err.message);
    }
  }
}

/**
 * Função principal que executa todos os testes
 */
async function main() {
  console.log('🚀 Iniciando testes de conectividade do banco de dados\n');
  console.log('📋 Configuração:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'não configurada'}\n`);
  
  const results = {
    connection: false,
    tables: {},
    crud: false,
    rls: false
  };
  
  // Teste 1: Conectividade
  results.connection = await testConnection();
  
  if (!results.connection) {
    console.log('\n❌ Falha na conectividade. Verifique as configurações.');
    return;
  }
  
  // Teste 2: Tabelas
  results.tables = await checkTables();
  
  // Teste 3: Operações CRUD
  results.crud = await testCRUDOperations();
  
  // Teste 4: Políticas RLS
  results.rls = await testRLSPolicies();
  
  // Teste 5: Dados de exemplo
  await checkSampleData();
  
  // Resumo final
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('========================');
  console.log(`🔗 Conectividade: ${results.connection ? '✅' : '❌'}`);
  console.log(`📋 Tabelas: ${Object.values(results.tables).every(Boolean) ? '✅' : '❌'}`);
  console.log(`🔧 CRUD: ${results.crud ? '✅' : '❌'}`);
  console.log(`🔒 RLS: ${results.rls ? '✅' : '❌'}`);
  
  const allPassed = results.connection && 
                   Object.values(results.tables).every(Boolean) && 
                   results.crud && 
                   results.rls;
  
  console.log(`\n${allPassed ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️  ALGUNS TESTES FALHARAM'}`);
}

// Executa os testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  testConnection,
  checkTables,
  testCRUDOperations,
  testRLSPolicies,
  checkSampleData
};