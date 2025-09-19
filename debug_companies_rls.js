import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function debugCompaniesRLS() {
  console.log('🔍 Debugando políticas RLS da tabela companies...\n');

  try {
    // 1. Verificar se a tabela existe e suas colunas
    console.log('1. Verificando estrutura da tabela companies...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError.message);
      return;
    }
    console.log('✅ Tabela companies acessível');

    // 2. Verificar se RLS está habilitado
    console.log('\n2. Verificando se RLS está habilitado...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_status', {
      table_name: 'companies'
    });
    
    if (rlsError) {
      console.log('⚠️ Não foi possível verificar status RLS via RPC:', rlsError.message);
    } else {
      console.log('RLS Status:', rlsStatus);
    }

    // 3. Tentar autenticar usuário
    console.log('\n3. Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'test123456'
    });

    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
      return;
    }

    console.log('✅ Usuário autenticado:', authData.user?.id);

    // 4. Verificar se o usuário está realmente autenticado
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Usuário atual:', user?.id || 'Não autenticado');

    // 5. Tentar INSERT com dados mínimos
    console.log('\n4. Tentando INSERT na tabela companies...');
    const { data: insertData, error: insertError } = await supabase
      .from('companies')
      .insert({
        name: 'Empresa Teste Debug',
        email: 'debug@test.com'
      })
      .select();

    if (insertError) {
      console.log('❌ Erro no INSERT:', insertError);
      console.log('Código do erro:', insertError.code);
      console.log('Detalhes:', insertError.details);
      console.log('Hint:', insertError.hint);
    } else {
      console.log('✅ INSERT realizado com sucesso:', insertData);
    }

    // 6. Verificar políticas existentes (se possível)
    console.log('\n5. Tentando listar políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_table_policies', {
      table_name: 'companies'
    });

    if (policiesError) {
      console.log('⚠️ Não foi possível listar políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas encontradas:', policies);
    }

    // 7. Testar SELECT para comparar
    console.log('\n6. Testando SELECT para comparar...');
    const { data: selectData, error: selectError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (selectError) {
      console.log('❌ Erro no SELECT:', selectError.message);
    } else {
      console.log('✅ SELECT funcionou, registros encontrados:', selectData?.length || 0);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar debug
debugCompaniesRLS();