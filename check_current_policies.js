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

async function checkPolicies() {
  console.log('🔍 Verificando políticas RLS atuais na tabela profiles...\n');

  try {
    // Usar uma consulta SQL simples através do cliente Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(0); // Não queremos dados, só queremos testar a conexão

    if (error) {
      console.log('📊 Informações do erro atual:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Conexão com a tabela profiles funcionando');
    }

    // Tentar criar um usuário de teste e ver o que acontece
    console.log('\n2️⃣ Testando autenticação...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

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
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError);
      return;
    }

    console.log('✅ Login realizado');

    // Tentar inserir perfil
    console.log('\n3️⃣ Tentando criar perfil...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signInData.user.id,
        display_name: 'Teste Usuario',
        phone: '+5511999999999'
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
      
      // Vamos verificar se o usuário está realmente autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('\n🔍 Status de autenticação:');
      console.log('   User ID:', user?.id);
      console.log('   Email:', user?.email);
      console.log('   Tentando inserir com ID:', signInData.user.id);
      console.log('   IDs coincidem:', user?.id === signInData.user.id);
      
    } else {
      console.log('✅ PERFIL CRIADO COM SUCESSO:', profileData);
    }

    // Limpar dados de teste
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPolicies();