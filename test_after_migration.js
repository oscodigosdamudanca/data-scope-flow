import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Configurar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAfterMigration() {
  console.log('🎯 TESTE FINAL - Validando Correção da Migração RLS\n');

  try {
    // Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    const testEmail = `final_test_${Date.now()}@example.com`;
    const testPassword = 'FinalTest123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.error('❌ Erro no signup:', signUpError);
      return;
    }

    console.log('✅ Usuário criado:', signUpData.user?.id);

    // Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      return;
    }

    console.log('✅ Login realizado com sucesso');

    // Tentar criar perfil
    console.log('\n3️⃣ Tentando criar perfil...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signInData.user.id,
        display_name: 'Usuário Final Test',
        phone: '+5511987654321'
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
      console.log('   - A migração ainda NÃO foi aplicada no banco remoto');
      console.log('   - Execute o SQL no painel do Supabase e rode este teste novamente');
      
    } else {
      console.log('🎉 SUCESSO! PERFIL CRIADO:', profileData);
      console.log('\n✅ MIGRAÇÃO APLICADA COM SUCESSO!');
      console.log('   - A política RLS foi corrigida');
      console.log('   - Usuários podem criar seus próprios perfis');
      console.log('   - O sistema está funcionando corretamente');
      
      // Limpar dados de teste
      await supabase.from('profiles').delete().eq('id', signInData.user.id);
      console.log('🧹 Dados de teste removidos');
    }

    // Logout
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAfterMigration();