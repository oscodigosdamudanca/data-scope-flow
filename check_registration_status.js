import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRegistrationStatus() {
  console.log('🔍 Verificando status do registro...\n');

  try {
    // Tentar fazer login com as credenciais para verificar se o usuário existe
    console.log('📧 Tentando verificar se o usuário foi registrado...');
    
    // Primeiro, vamos verificar se conseguimos acessar a tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao acessar profiles:', profilesError);
      
      // Se o erro for de RLS, significa que o usuário não está autenticado
      if (profilesError.code === 'PGRST301' || profilesError.message.includes('RLS')) {
        console.log('\n🔐 Erro de RLS detectado - isso é esperado sem autenticação');
        console.log('📝 Vamos tentar fazer login para verificar se o usuário existe...');
        
        // Tentar fazer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'santananegociosdigitais@gmail.com',
          password: 'sua_senha_aqui' // Você precisará inserir a senha correta
        });

        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            console.log('\n⚠️  Usuário não encontrado ou senha incorreta');
            console.log('📝 O registro pode não ter sido concluído com sucesso');
            console.log('\n🔄 Tente registrar novamente em: http://localhost:8080/auth');
          } else {
            console.error('❌ Erro no login:', loginError);
          }
        } else {
          console.log('\n✅ Login realizado com sucesso!');
          console.log(`👤 Usuário ID: ${loginData.user.id}`);
          console.log(`📧 Email: ${loginData.user.email}`);
          
          // Agora verificar o perfil
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user.id)
            .single();

          if (profileError) {
            console.error('❌ Erro ao buscar perfil:', profileError);
            console.log('\n🛠️  Perfil não encontrado - vamos criar um...');
            
            // Criar perfil
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: loginData.user.id,
                display_name: 'Gilberto Santana',
                phone: null,
                app_role: 'developer'
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
          } else {
            console.log('\n✅ Perfil encontrado!');
            console.log(`👤 Nome: ${userProfile.display_name || 'Não informado'}`);
            console.log(`🔑 Role: ${userProfile.app_role || 'Não definido'}`);
            
            if (userProfile.app_role !== 'developer') {
              console.log('\n🔧 Atualizando role para developer...');
              
              const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ app_role: 'developer' })
                .eq('id', loginData.user.id)
                .select()
                .single();

              if (updateError) {
                console.error('❌ Erro ao atualizar role:', updateError);
              } else {
                console.log('✅ Role atualizada com sucesso!');
                console.log(`🔑 Nova role: ${updatedProfile.app_role}`);
              }
            }
          }
        }
      }
    } else {
      console.log(`📊 Profiles acessíveis: ${profiles.length}`);
      if (profiles.length > 0) {
        console.log('✅ Usuários encontrados:');
        profiles.forEach(profile => {
          console.log(`   - ${profile.display_name || 'Sem nome'} (${profile.app_role || 'Sem role'})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkRegistrationStatus();