import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.log('URL:', supabaseUrl ? '✅' : '❌');
  console.log('Key:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicyStatus() {
  console.log('🔍 VERIFICANDO STATUS DAS POLÍTICAS RLS\n');

  try {
    // Tentar criar um usuário e perfil para testar a política
    console.log('1️⃣ Criando usuário de teste...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456'
    });

    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError);
      return;
    }

    console.log('✅ Usuário criado:', signUpData.user?.id);

    // Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'test123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }

    console.log('✅ Login realizado com sucesso');

    // Tentar criar perfil
    console.log('\n3️⃣ Tentando criar perfil...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signUpData.user.id,
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
      if (profileError.code === '42501') {
        console.log('   - Erro de política RLS detectado');
        console.log('   - A migração ainda não foi aplicada no banco remoto');
        console.log('   - Execute o SQL no painel do Supabase');
      }
    } else {
      console.log('✅ PERFIL CRIADO COM SUCESSO:', profileData);
      console.log('\n🎉 A migração foi aplicada corretamente!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPolicyStatus();