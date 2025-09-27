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

async function checkUsersStatus() {
  console.log('🔍 Verificando status dos usuários no sistema...\n');

  try {
    // 1. Verificar total de usuários
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
      return;
    }

    console.log(`📊 Total de usuários cadastrados: ${profiles.length}\n`);

    if (profiles.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no sistema');
      console.log('📝 Próximo passo: Registrar primeiro usuário via interface web\n');
      console.log('🔗 Acesse: http://localhost:8080/auth');
      console.log('📧 Use o email: santananegociosdigitais@gmail.com');
      return;
    }

    // 2. Listar usuários existentes
    console.log('👥 Usuários cadastrados:');
    console.log('═'.repeat(80));
    
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`);
      console.log(`   Nome: ${profile.display_name || 'Não informado'}`);
      console.log(`   Telefone: ${profile.phone || 'Não informado'}`);
      console.log(`   Role: ${profile.app_role || 'Não definido'}`);
      console.log(`   Criado em: ${new Date(profile.created_at).toLocaleString('pt-BR')}`);
      console.log('─'.repeat(40));
    });

    // 3. Verificar se existe desenvolvedor
    const developers = profiles.filter(p => p.app_role === 'developer');
    
    if (developers.length === 0) {
      console.log('\n⚠️  Nenhum usuário com role "developer" encontrado');
      console.log('🎯 Próximo passo: Atribuir role "developer" a um usuário existente');
      
      if (profiles.length > 0) {
        console.log('\n💡 Usuários disponíveis para promover a developer:');
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.display_name || 'Sem nome'} (${profile.id})`);
        });
      }
    } else {
      console.log('\n✅ Desenvolvedor(es) encontrado(s):');
      developers.forEach(dev => {
        console.log(`   - ${dev.display_name || 'Sem nome'} (${dev.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkUsersStatus();