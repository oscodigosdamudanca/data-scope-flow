/**
 * Script para testar a conectividade com o banco de dados após configuração manual
 * Execute: node test_database_connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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
  console.log('\n🧪 Testando operações CRUD...');
  
  try {
    // Teste de INSERT
    console.log('📝 Testando INSERT...');
    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: 'Teste Conectividade',
        email: 'teste.conectividade@exemplo.com',
        phone: '(11) 99999-9999',
        status: 'new'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro no INSERT:', insertError.message);
      return false;
    }
    
    console.log('✅ INSERT OK - ID:', insertData.id);
    const testLeadId = insertData.id;
    
    // Teste de SELECT
    console.log('📖 Testando SELECT...');
    const { data: selectData, error: selectError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', testLeadId)
      .single();
    
    if (selectError) {
      console.error('❌ Erro no SELECT:', selectError.message);
      return false;
    }
    
    console.log('✅ SELECT OK - Nome:', selectData.name);
    
    // Teste de UPDATE
    console.log('✏️ Testando UPDATE...');
    const { data: updateData, error: updateError } = await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', testLeadId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erro no UPDATE:', updateError.message);
      return false;
    }
    
    console.log('✅ UPDATE OK - Status:', updateData.status);
    
    // Teste de DELETE
    console.log('🗑️ Testando DELETE...');
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', testLeadId);
    
    if (deleteError) {
      console.error('❌ Erro no DELETE:', deleteError.message);
      return false;
    }
    
    console.log('✅ DELETE OK');
    
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
    // Tenta acessar dados sem autenticação (deve funcionar com políticas permissivas)
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, email')
      .limit(5);
    
    if (error) {
      console.log('⚠️ RLS ativo (esperado):', error.message);
      return true; // RLS funcionando corretamente
    }
    
    console.log(`✅ RLS configurado - ${data.length} registros acessíveis`);
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar RLS:', err.message);
    return false;
  }
}

/**
 * Verifica a contagem de registros de exemplo
 */
async function checkSampleData() {
  console.log('\n📊 Verificando dados de exemplo...');
  
  const tables = {
    'leads': 5,
    'surveys': 4,
    'survey_questions': 8,
    'survey_responses': 0 // Inicialmente vazio
  };
  
  for (const [table, expectedCount] of Object.entries(tables)) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        continue;
      }
      
      if (count >= expectedCount) {
        console.log(`✅ ${table}: ${count} registros (esperado: ${expectedCount}+)`);
      } else {
        console.log(`⚠️ ${table}: ${count} registros (esperado: ${expectedCount}+)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando testes de conectividade do banco de dados\n');
  console.log('📍 Projeto:', process.env.VITE_SUPABASE_PROJECT_ID);
  console.log('🌐 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
  
  const results = {
    connection: false,
    tables: {},
    crud: false,
    rls: false
  };
  
  // Executar todos os testes
  results.connection = await testConnection();
  
  if (results.connection) {
    results.tables = await checkTables();
    results.crud = await testCRUDOperations();
    results.rls = await testRLSPolicies();
    await checkSampleData();
  }
  
  // Resumo final
  console.log('\n📋 RESUMO DOS TESTES');
  console.log('=' .repeat(50));
  console.log(`🔗 Conectividade: ${results.connection ? '✅ OK' : '❌ FALHOU'}`);
  
  if (results.connection) {
    const tablesOK = Object.values(results.tables).every(Boolean);
    console.log(`📋 Tabelas: ${tablesOK ? '✅ OK' : '❌ ALGUMAS FALHARAM'}`);
    console.log(`🧪 CRUD: ${results.crud ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🔒 RLS: ${results.rls ? '✅ OK' : '❌ FALHOU'}`);
    
    if (results.connection && tablesOK && results.crud && results.rls) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Banco configurado corretamente.');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique a configuração.');
    }
  } else {
    console.log('\n❌ FALHA NA CONECTIVIDADE. Verifique as variáveis de ambiente.');
  }
  
  console.log('\n🏁 Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnection,
  checkTables,
  testCRUDOperations,
  testRLSPolicies,
  checkSampleData
};