const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 TESTE DIRETO DE CONEXÃO MCP SUPABASE');
console.log('=====================================');
console.log('📊 Projeto ID:', process.env.VITE_SUPABASE_PROJECT_ID);
console.log('🌐 URL:', process.env.VITE_SUPABASE_URL);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testDirectConnection() {
  const results = {
    connectionTime: 0,
    basicConnection: false,
    authWorking: false,
    tablesAccessible: false,
    rlsStatus: 'unknown',
    errorDetails: []
  };

  try {
    console.log('\n🔍 TESTE 1: Conexão básica com Supabase...');
    const start = Date.now();
    
    // Teste mais simples possível - verificar se o Supabase responde
    const { data: healthCheck, error: healthError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'information_schema')
      .limit(1);
    
    results.connectionTime = Date.now() - start;
    
    if (healthError) {
      console.log('❌ Erro na conexão básica:', healthError.message);
      results.errorDetails.push('Conexão básica: ' + healthError.message);
    } else {
      results.basicConnection = true;
      console.log('✅ Conexão básica estabelecida!');
      console.log('⚡ Tempo de resposta:', results.connectionTime + 'ms');
    }
    
    // Teste 2: Verificar autenticação
    console.log('\n🔍 TESTE 2: Verificando sistema de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️ Erro na verificação de auth:', authError.message);
      results.errorDetails.push('Auth: ' + authError.message);
    } else {
      results.authWorking = true;
      console.log('✅ Sistema de autenticação respondendo!');
    }
    
    // Teste 3: Tentar acessar tabelas públicas sem autenticação
    console.log('\n🔍 TESTE 3: Testando acesso a tabelas públicas...');
    const { data: publicTables, error: publicError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (publicError) {
      console.log('❌ Erro no acesso a tabelas públicas:', publicError.message);
      results.errorDetails.push('Tabelas públicas: ' + publicError.message);
    } else {
      results.tablesAccessible = true;
      console.log('✅ Acesso a informações de tabelas funcionando!');
      if (publicTables && publicTables.length > 0) {
        console.log('📋 Tabelas encontradas:', publicTables.length);
        publicTables.forEach(table => {
          console.log('  - ' + table.table_name);
        });
      }
    }
    
    // Teste 4: Tentar uma operação simples na tabela profiles
    console.log('\n🔍 TESTE 4: Testando acesso específico à tabela profiles...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erro no acesso a profiles:', profilesError.message);
      results.errorDetails.push('Profiles: ' + profilesError.message);
      
      // Verificar se é problema de RLS
      if (profilesError.message.includes('infinite recursion')) {
        results.rlsStatus = 'recursion_error';
        console.log('🔍 DIAGNÓSTICO: Problema de recursão infinita confirmado!');
      } else if (profilesError.message.includes('permission denied')) {
        results.rlsStatus = 'permission_denied';
        console.log('🔍 DIAGNÓSTICO: Problema de permissões RLS');
      }
    } else {
      console.log('✅ Acesso a profiles funcionando!');
      results.rlsStatus = 'working';
    }
    
    // Teste 5: Tentar acessar module_permissions
    console.log('\n🔍 TESTE 5: Testando acesso à tabela module_permissions...');
    const { data: permissionsTest, error: permissionsError } = await supabase
      .from('module_permissions')
      .select('id')
      .limit(1);
    
    if (permissionsError) {
      console.log('❌ Erro no acesso a module_permissions:', permissionsError.message);
      results.errorDetails.push('Module_permissions: ' + permissionsError.message);
    } else {
      console.log('✅ Acesso a module_permissions funcionando!');
    }
    
  } catch (err) {
    console.log('❌ Erro crítico durante os testes:', err.message);
    results.errorDetails.push('Erro crítico: ' + err.message);
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - TESTE DIRETO MCP SUPABASE');
  console.log('='.repeat(60));
  console.log('🔗 Conexão básica:', results.basicConnection ? '✅ FUNCIONANDO' : '❌ FALHA');
  console.log('🔐 Sistema de auth:', results.authWorking ? '✅ FUNCIONANDO' : '❌ FALHA');
  console.log('📋 Acesso a tabelas:', results.tablesAccessible ? '✅ FUNCIONANDO' : '❌ FALHA');
  console.log('⚡ Tempo de resposta:', results.connectionTime + 'ms');
  console.log('🛡️ Status RLS:', results.rlsStatus.toUpperCase());
  
  if (results.errorDetails.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    results.errorDetails.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  // Diagnóstico e recomendações
  console.log('\n🎯 DIAGNÓSTICO:');
  if (results.basicConnection && results.authWorking && results.tablesAccessible) {
    if (results.rlsStatus === 'recursion_error') {
      console.log('⚠️ PROBLEMA IDENTIFICADO: Recursão infinita nas políticas RLS');
      console.log('💡 SOLUÇÃO: Aplicar correção das políticas RLS via Supabase Dashboard');
    } else if (results.rlsStatus === 'working') {
      console.log('✅ SISTEMA TOTALMENTE FUNCIONAL');
    } else {
      console.log('⚠️ PROBLEMA PARCIAL: RLS com configuração inadequada');
    }
  } else {
    console.log('❌ PROBLEMAS DE CONECTIVIDADE BÁSICA');
    console.log('💡 VERIFICAR: Credenciais, URL e status do projeto Supabase');
  }
  
  console.log('='.repeat(60));
}

testDirectConnection();