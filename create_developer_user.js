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

// Cliente com service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDeveloperUser() {
  console.log('🔧 Configurando primeiro usuário como desenvolvedor...\n');

  try {
    // 1. Buscar usuários existentes
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError);
      return;
    }

    if (profiles.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado!');
      console.log('📝 Primeiro registre um usuário via interface web em: http://localhost:8080/auth');
      console.log('📧 Use o email: santananegociosdigitais@gmail.com');
      return;
    }

    console.log(`📊 Encontrados ${profiles.length} usuário(s):`);
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.display_name || 'Sem nome'} - Role: ${profile.app_role || 'Não definido'}`);
    });

    // 2. Verificar se já existe um desenvolvedor
    const existingDeveloper = profiles.find(p => p.app_role === 'developer');
    if (existingDeveloper) {
      console.log(`\n✅ Já existe um desenvolvedor: ${existingDeveloper.display_name || 'Sem nome'}`);
      return;
    }

    // 3. Promover o primeiro usuário (mais recente) a developer
    const userToPromote = profiles[0];
    console.log(`\n🎯 Promovendo usuário a developer: ${userToPromote.display_name || 'Sem nome'}`);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ app_role: 'developer' })
      .eq('id', userToPromote.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar role:', updateError);
      return;
    }

    console.log('✅ Usuário promovido com sucesso!');
    console.log(`👤 Nome: ${updatedProfile.display_name || 'Sem nome'}`);
    console.log(`🔑 Role: ${updatedProfile.app_role}`);
    console.log(`📅 Atualizado em: ${new Date(updatedProfile.updated_at).toLocaleString('pt-BR')}`);

    // 4. Verificar permissões do desenvolvedor
    console.log('\n🔍 Verificando permissões do desenvolvedor...');
    
    const { data: permissions, error: permError } = await supabase
      .from('module_permissions')
      .select('*')
      .eq('role_type', 'app_role')
      .eq('role_name', 'developer');

    if (permError) {
      console.error('❌ Erro ao verificar permissões:', permError);
    } else {
      console.log(`📋 Permissões encontradas: ${permissions.length}`);
      permissions.forEach(perm => {
        console.log(`   - ${perm.module_name}: ${JSON.stringify(perm.permissions)}`);
      });
    }

    console.log('\n🎉 Configuração do desenvolvedor concluída!');
    console.log('🔗 Agora você pode fazer login em: http://localhost:8080/auth');
    console.log('📧 Email: santananegociosdigitais@gmail.com');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar configuração
createDeveloperUser();