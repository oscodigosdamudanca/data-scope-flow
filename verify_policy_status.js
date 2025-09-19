import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Usando a chave pública disponível

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPolicyStatus() {
  console.log('🔍 VERIFICANDO STATUS DAS POLÍTICAS RLS\n');

  try {
    // Verificar políticas existentes na tabela profiles
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');

    if (error) {
      console.error('❌ Erro ao consultar políticas:', error);
      return;
    }

    console.log('📋 POLÍTICAS ENCONTRADAS:');
    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. Nome: ${policy.policyname}`);
        console.log(`   Comando: ${policy.cmd}`);
        console.log(`   Permissivo: ${policy.permissive}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Qual: ${policy.qual}`);
        console.log(`   With Check: ${policy.with_check}`);
      });
    } else {
      console.log('   Nenhuma política encontrada');
    }

    // Testar criação de perfil com usuário autenticado
    console.log('\n🧪 TESTANDO CRIAÇÃO DE PERFIL...');
    
    // Criar usuário de teste
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test123456',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return;
    }

    console.log('✅ Usuário criado:', authData.user.id);

    // Fazer login com o usuário
    const userSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    const { data: loginData, error: loginError } = await userSupabase.auth.signInWithPassword({
      email: authData.user.email,
      password: 'test123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }

    console.log('✅ Login realizado com sucesso');

    // Tentar criar perfil
    const { data: profileData, error: profileError } = await userSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        display_name: 'Usuário Teste',
        phone: '11999999999'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ ERRO AO CRIAR PERFIL:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   - A política RLS ainda não está funcionando corretamente');
      console.log('   - Verifique se a migração foi aplicada completamente');
    } else {
      console.log('✅ PERFIL CRIADO COM SUCESSO:', profileData);
      console.log('\n🎉 A migração foi aplicada corretamente!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verifyPolicyStatus();