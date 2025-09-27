import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Necessário: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente com service role para acessar auth.users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthUsers() {
  console.log('🔍 Verificando usuários na tabela auth.users...\n');

  try {
    // 1. Verificar usuários na tabela auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erro ao buscar usuários auth:', authError);
      return;
    }

    console.log(`📊 Total de usuários na auth.users: ${authUsers.users.length}\n`);

    if (authUsers.users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado na tabela auth.users');
      console.log('📝 O registro não foi concluído com sucesso');
      return;
    }

    // 2. Listar usuários auth
    console.log('👥 Usuários na auth.users:');
    console.log('═'.repeat(80));
    
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}`);
      console.log('─'.repeat(40));
    });

    // 3. Verificar usuários na tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
      return;
    }

    console.log(`\n📊 Total de usuários na profiles: ${profiles.length}`);

    if (profiles.length === 0) {
      console.log('\n⚠️  Nenhum perfil encontrado na tabela profiles');
      console.log('🔧 O trigger de criação de perfil pode não estar funcionando');
      
      // Tentar criar perfil manualmente para o usuário auth
      if (authUsers.users.length > 0) {
        const authUser = authUsers.users[0];
        console.log(`\n🛠️  Tentando criar perfil para: ${authUser.email}`);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            display_name: 'Gilberto Santana',
            phone: null,
            app_role: 'developer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError);
        } else {
          console.log('✅ Perfil criado com sucesso!');
          console.log(`👤 Nome: ${newProfile.display_name}`);
          console.log(`🔑 Role: ${newProfile.app_role}`);
        }
      }
    } else {
      console.log('\n✅ Perfis encontrados:');
      profiles.forEach(profile => {
        console.log(`   - ${profile.display_name || 'Sem nome'} (${profile.app_role || 'Sem role'})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkAuthUsers();