import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreationAfterFix() {
  console.log('🔧 Teste de Criação de Perfil Após Correção RLS\n');

  try {
    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });

    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso');
    console.log('   ID:', signUpData.user?.id);

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: signUpData.user?.email,
      password: 'testpassword123'
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');

    // 3. Verificar se já existe perfil
    console.log('\n3️⃣ Verificando perfil existente...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil:', profileCheckError);
      return;
    }

    if (existingProfile) {
      console.log('ℹ️  Perfil já existe:', existingProfile);
      return;
    }

    console.log('✅ Nenhum perfil encontrado, prosseguindo com criação');

    // 4. Tentar criar perfil
    console.log('\n4️⃣ Tentando criar perfil...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: signInData.user.id,
          display_name: 'Usuário Teste',
          phone: '+5511999999999'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('❌ ERRO AO CRIAR PERFIL:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
      return;
    }

    console.log('✅ PERFIL CRIADO COM SUCESSO!');
    console.log('   Dados:', newProfile);

    // 5. Verificar se o perfil foi realmente criado
    console.log('\n5️⃣ Verificando se o perfil foi salvo...');
    const { data: savedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar perfil salvo:', verifyError);
      return;
    }

    console.log('✅ Perfil verificado com sucesso:', savedProfile);

    // 6. Limpar dados de teste
    console.log('\n6️⃣ Limpando dados de teste...');
    await supabase.from('profiles').delete().eq('id', signInData.user.id);
    console.log('✅ Dados de teste removidos');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }

  console.log('\n🏁 Teste concluído');
}

testProfileCreationAfterFix();