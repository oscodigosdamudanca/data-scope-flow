const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Iniciando teste de conexão MCP Supabase OTIMIZADO...');
console.log('📊 Projeto ID:', process.env.VITE_SUPABASE_PROJECT_ID);
console.log('🌐 URL:', process.env.VITE_SUPABASE_URL);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testConnectionOptimized() {
  const results = {
    connection: false,
    responseTime: 0,
    tablesCount: 0,
    profilesAccess: false,
    modulePermissionsAccess: false,
    rlsEnabled: false
  };

  try {
    console.log('\n🔍 Teste 1: Verificando conexão básica...');
    const start = Date.now();
    
    // Teste de conexão com a tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    results.responseTime = Date.now() - start;
    
    if (profilesError) {
      console.log('❌ Erro na conexão com profiles:', profilesError.message);
    } else {
      results.connection = true;
      results.profilesAccess = true;
      console.log('✅ Conexão com profiles estabelecida!');
    }
    
    console.log('⚡ Tempo de resposta:', results.responseTime + 'ms');
    
    // Teste 2: Verificar acesso à tabela module_permissions
    console.log('\n🔍 Teste 2: Verificando acesso a module_permissions...');
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('module_permissions')
      .select('id')
      .limit(1);
    
    if (permissionsError) {
      console.log('❌ Erro no acesso a module_permissions:', permissionsError.message);
    } else {
      results.modulePermissionsAccess = true;
      console.log('✅ Acesso a module_permissions confirmado!');
    }
    
    // Teste 3: Verificar RLS
    console.log('\n🔍 Teste 3: Verificando status do RLS...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_status');
    
    if (!rlsError) {
      results.rlsEnabled = true;
      console.log('✅ RLS verificado com sucesso!');
    } else {
      console.log('⚠️ Não foi possível verificar RLS via RPC');
    }
    
    // Teste 4: Contagem de tabelas
    console.log('\n🔍 Teste 4: Verificando estrutura do banco...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      results.tablesCount = tables.length;
      console.log('📋 Tabelas encontradas:', results.tablesCount);
      
      // Mostrar algumas tabelas importantes
      const importantTables = tables.filter(t => 
        ['profiles', 'module_permissions', 'companies', 'leads'].includes(t.table_name)
      );
      
      if (importantTables.length > 0) {
        console.log('🎯 Tabelas críticas encontradas:');
        importantTables.forEach(table => {
          console.log('  ✓ ' + table.table_name);
        });
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO FINAL DO TESTE MCP SUPABASE');
    console.log('='.repeat(50));
    console.log('🔗 Conexão básica:', results.connection ? '✅ SUCESSO' : '❌ FALHA');
    console.log('⚡ Tempo de resposta:', results.responseTime + 'ms');
    console.log('👤 Acesso a profiles:', results.profilesAccess ? '✅ OK' : '❌ FALHA');
    console.log('🔐 Acesso a permissions:', results.modulePermissionsAccess ? '✅ OK' : '❌ FALHA');
    console.log('📋 Tabelas no banco:', results.tablesCount);
    console.log('🛡️ RLS verificado:', results.rlsEnabled ? '✅ OK' : '⚠️ PARCIAL');
    
    const overallStatus = results.connection && results.profilesAccess && results.modulePermissionsAccess;
    console.log('\n🎯 STATUS GERAL:', overallStatus ? '✅ EXCELENTE' : '❌ REQUER ATENÇÃO');
    
    if (results.responseTime < 500) {
      console.log('📈 Performance: 🚀 EXCELENTE (<500ms)');
    } else if (results.responseTime < 1000) {
      console.log('📈 Performance: ⚡ BOA (<1s)');
    } else {
      console.log('📈 Performance: ⚠️ LENTA (>1s)');
    }
    
    console.log('='.repeat(50));
    
  } catch (err) {
    console.log('❌ Erro crítico durante o teste:', err.message);
    console.log('🔧 Verifique as configurações do .env e a conectividade');
  }
}

testConnectionOptimized();