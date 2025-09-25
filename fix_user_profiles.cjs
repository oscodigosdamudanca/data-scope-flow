const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Carregar variáveis do .env
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key] = value.replace(/"/g, '');
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserProfile() {
  try {
    console.log('Verificando perfis de usuários...');
    
    // Buscar todos os perfis
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, app_role, display_name')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar perfis:', error);
      return;
    }
    
    console.log('Perfis encontrados:', profiles);
    
    // Verificar se há usuários sem app_role
    const usersWithoutRole = profiles.filter(p => !p.app_role);
    console.log('Usuários sem app_role:', usersWithoutRole);
    
    // Atualizar usuários sem role para interviewer
    if (usersWithoutRole.length > 0) {
      console.log('Atualizando usuários sem role...');
      for (const user of usersWithoutRole) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ app_role: 'interviewer' })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Erro ao atualizar usuário', user.id, ':', updateError);
        } else {
          console.log('Usuário', user.id, 'atualizado para interviewer');
        }
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkUserProfile();