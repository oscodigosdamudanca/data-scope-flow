import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticProfileRLS() {
  console.log('🔍 Diagnóstico do Erro de RLS na Criação de Perfis\n');
  
  try {
    // 1. Verificar se o usuário está autenticado
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erro de autenticação:', authError.message);
      
      // Tentar fazer login com um usuário de teste
      console.log('🔐 Tentando fazer login com usuário de teste...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (loginError) {
        console.log('❌ Erro no login:', loginError.message);
        console.log('ℹ️  Criando usuário de teste...');
        
        // Tentar criar usuário de teste
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'testpassword123'
        });
        
        if (signupError) {
          console.log('❌ Erro ao criar usuário:', signupError.message);
          return;
        }
        
        console.log('✅ Usuário criado com sucesso');
        console.log('   ID:', signupData.user?.id);
      } else {
        console.log('✅ Login realizado com sucesso');
        console.log('   ID:', loginData.user?.id);
      }
    } else {
      console.log('✅ Usuário autenticado');
      console.log('   ID:', user?.id);
      console.log('   Email:', user?.email);
    }

    // Obter usuário atual após possível login
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.log('❌ Nenhum usuário autenticado');
      return;
    }

    // 2. Verificar se já existe um perfil
    console.log('\n2️⃣ Verificando perfil existente...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.log('❌ Erro ao verificar perfil:', profileCheckError.message);
    } else if (existingProfile) {
      console.log('⚠️  Perfil já existe:', existingProfile);
      
      // Tentar deletar o perfil existente para testar a criação
      console.log('🗑️  Tentando deletar perfil existente...');
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);
      
      if (deleteError) {
        console.log('❌ Erro ao deletar perfil:', deleteError.message);
      } else {
        console.log('✅ Perfil deletado com sucesso');
      }
    } else {
      console.log('✅ Nenhum perfil encontrado');
    }

    // 3. Verificar roles do usuário
    console.log('\n3️⃣ Verificando roles do usuário...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', currentUser.id);

    if (rolesError) {
      console.log('❌ Erro ao verificar roles:', rolesError.message);
    } else {
      console.log('📋 Roles encontradas:', userRoles);
      
      if (userRoles.length === 0) {
        console.log('⚠️  Usuário não tem roles definidas');
        console.log('🔧 Tentando adicionar role developer...');
        
        const { data: newRole, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: currentUser.id,
            role: 'developer'
          })
          .select()
          .single();
        
        if (roleError) {
          console.log('❌ Erro ao adicionar role:', roleError.message);
        } else {
          console.log('✅ Role developer adicionada:', newRole);
        }
      }
    }

    // 4. Tentar criar o perfil
    console.log('\n4️⃣ Tentando criar perfil...');
    const profileData = {
      id: currentUser.id,
      display_name: 'Usuário Teste',
      phone: '(11) 99999-9999'
    };

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (createError) {
      console.log('❌ ERRO AO CRIAR PERFIL:', createError);
      console.log('   Código:', createError.code);
      console.log('   Mensagem:', createError.message);
      console.log('   Detalhes:', createError.details);
      console.log('   Hint:', createError.hint);
      
      // 5. Executar diagnósticos SQL
      console.log('\n5️⃣ Executando diagnósticos SQL...');
      
      // Verificar políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              policyname,
              cmd,
              permissive,
              roles,
              qual,
              with_check
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'profiles'
            ORDER BY policyname;
          `
        });
      
      if (policiesError) {
        console.log('❌ Erro ao verificar políticas:', policiesError.message);
      } else {
        console.log('📋 Políticas RLS da tabela profiles:', policies);
      }
      
    } else {
      console.log('✅ PERFIL CRIADO COM SUCESSO:', newProfile);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar diagnóstico
diagnosticProfileRLS().then(() => {
  console.log('\n🏁 Diagnóstico concluído');
}).catch(error => {
  console.error('❌ Erro fatal:', error);
});