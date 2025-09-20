import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function createTestUser() {
  console.log('🔍 Criando usuário de teste...');
  
  try {
    // Tentar criar um novo usuário
    const testEmail = 'teste@datascopeflow.com';
    const testPassword = 'TestPassword123!';
    
    console.log('📝 Tentando criar usuário:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Usuário Teste'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError.message);
      
      // Se o usuário já existe, tentar fazer login
      if (signUpError.message.includes('already registered')) {
        console.log('👤 Usuário já existe, tentando fazer login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        if (loginError) {
          console.error('❌ Erro no login:', loginError.message);
          return;
        }
        
        console.log('✅ Login realizado com sucesso');
        await testCompanyCreation(loginData.user);
      }
      return;
    }

    console.log('✅ Usuário criado com sucesso:', signUpData.user?.id);
    
    // Aguardar um pouco para o usuário ser processado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fazer login com o usuário criado
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login após criação:', loginError.message);
      return;
    }

    console.log('✅ Login realizado após criação');
    await testCompanyCreation(loginData.user);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

async function testCompanyCreation(user) {
  console.log('\n🧪 Testando criação de empresa com usuário:', user.id);
  
  try {
    // Verificar roles do usuário
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('📋 Roles do usuário:', roles);
    
    // Tentar criar empresa
    const companyData = {
      name: 'Empresa Teste ' + Date.now(),
      created_by: user.id
    };

    console.log('📝 Tentando criar empresa:', companyData);

    const { data: insertedData, error: insertError } = await supabase
      .from('companies')
      .insert([companyData])
      .select();

    if (insertError) {
      console.error('❌ Erro ao criar empresa:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // Se falhou por falta de role, vamos tentar criar uma role de developer
      if (insertError.code === '42501') {
        console.log('\n🔧 Tentando criar role de developer para o usuário...');
        
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'developer'
          })
          .select();

        if (roleError) {
          console.error('❌ Erro ao criar role:', roleError.message);
        } else {
          console.log('✅ Role de developer criada:', roleData);
          
          // Tentar criar empresa novamente
          console.log('\n🔄 Tentando criar empresa novamente...');
          const { data: retryData, error: retryError } = await supabase
            .from('companies')
            .insert([companyData])
            .select();

          if (retryError) {
            console.error('❌ Ainda há erro ao criar empresa:', retryError.message);
          } else {
            console.log('🎉 SUCESSO! Empresa criada após adicionar role:', retryData);
          }
        }
      }
    } else {
      console.log('🎉 SUCESSO! Empresa criada:', insertedData);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

createTestUser();