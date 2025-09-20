import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function fixUserRole() {
  console.log('🔧 Corrigindo role do usuário...');
  
  try {
    // Fazer login com o usuário existente
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'gilbertosantana@gmail.com',
      password: 'Gilberto@2024'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso:', loginData.user.id);

    // Verificar roles atuais
    const { data: currentRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', loginData.user.id);

    console.log('📋 Roles atuais:', currentRoles);

    // Se não tem role, criar uma role de admin
    if (!currentRoles || currentRoles.length === 0) {
      console.log('🔧 Criando role de admin para o usuário...');
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: loginData.user.id,
          role: 'admin'
        })
        .select();

      if (roleError) {
        console.error('❌ Erro ao criar role:', roleError.message);
        return;
      }

      console.log('✅ Role de admin criada:', roleData);
    }

    // Testar criação de empresa
    console.log('\n🧪 Testando criação de empresa...');
    
    const companyData = {
      name: 'Razão Social',
      created_by: loginData.user.id
    };

    const { data: companyResult, error: companyError } = await supabase
      .from('companies')
      .insert([companyData])
      .select();

    if (companyError) {
      console.error('❌ Erro ao criar empresa:', {
        code: companyError.code,
        message: companyError.message,
        details: companyError.details,
        hint: companyError.hint
      });
    } else {
      console.log('🎉 SUCESSO! Empresa criada:', companyResult);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixUserRole();