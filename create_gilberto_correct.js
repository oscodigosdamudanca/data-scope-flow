import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createGilbertoUser() {
  console.log('👨‍💻 Criando usuário Gilberto Santana como desenvolvedor...\n');

  try {
    // Gerar um UUID único para o usuário
    const userId = crypto.randomUUID();
    
    // Dados do usuário Gilberto Santana (baseado na estrutura real da tabela profiles)
    const gilbertoProfile = {
      id: userId,
      display_name: 'Gilberto Santana',
      phone: '(85) 99999-9999',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📋 Dados do profile a ser criado:');
    Object.keys(gilbertoProfile).forEach(key => {
      console.log(`   - ${key}: ${gilbertoProfile[key]}`);
    });

    // 1. Inserir o usuário na tabela profiles
    console.log('\n1. Inserindo usuário na tabela profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([gilbertoProfile])
      .select();

    if (profileError) {
      console.error('❌ Erro ao inserir profile:', profileError.message);
      console.error('Detalhes do erro:', profileError);
      return;
    }

    console.log('✅ Profile criado com sucesso!');
    console.log('📊 Dados inseridos:', profileData);

    // 2. Inserir o role de desenvolvedor na tabela user_roles
    console.log('\n2. Inserindo role de desenvolvedor...');
    const userRole = {
      user_id: userId,
      role: 'developer',
      created_at: new Date().toISOString()
    };

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert([userRole])
      .select();

    if (roleError) {
      console.error('❌ Erro ao inserir role:', roleError.message);
      console.error('Detalhes do erro:', roleError);
    } else {
      console.log('✅ Role de desenvolvedor criado com sucesso!');
      console.log('📊 Dados do role:', roleData);
    }

    // 3. Criar uma empresa exemplo para o desenvolvedor
    console.log('\n3. Criando empresa exemplo para o desenvolvedor...');
    const companyData = {
      id: crypto.randomUUID(),
      name: 'DataScope Analytics',
      cnpj: '00.000.000/0001-00',
      email: 'contato@datascopeanalytics.com',
      phone: '(85) 99999-9999',
      address: 'Rua Exemplo, 123',
      city: 'Fortaleza',
      state: 'CE',
      zip_code: '60000-000',
      website: 'https://datascopeanalytics.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: companyResult, error: companyError } = await supabase
      .from('companies')
      .insert([companyData])
      .select();

    if (companyError) {
      console.log('⚠️  Aviso: Não foi possível criar empresa exemplo:', companyError.message);
    } else {
      console.log('✅ Empresa exemplo criada com sucesso!');
      console.log('🏢 Dados da empresa:', companyResult);

      // 4. Criar membership do desenvolvedor com a empresa
      console.log('\n4. Criando membership do desenvolvedor...');
      const membershipData = {
        user_id: userId,
        company_id: companyData.id,
        role: 'admin',
        created_at: new Date().toISOString()
      };

      const { data: membershipResult, error: membershipError } = await supabase
        .from('company_memberships')
        .insert([membershipData])
        .select();

      if (membershipError) {
        console.log('⚠️  Aviso: Não foi possível criar membership:', membershipError.message);
      } else {
        console.log('✅ Membership criado com sucesso!');
        console.log('👥 Dados do membership:', membershipResult);
      }
    }

    // 5. Verificar se o usuário foi criado corretamente
    console.log('\n5. Verificando se o usuário foi criado...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (verifyError) {
      console.error('❌ Erro ao verificar usuário:', verifyError.message);
      return;
    }

    if (verifyProfile && verifyProfile.length > 0) {
      console.log('✅ Usuário verificado com sucesso!');
      console.log('👨‍💻 Dados do profile:');
      const user = verifyProfile[0];
      Object.keys(user).forEach(key => {
        console.log(`   - ${key}: ${user[key]}`);
      });

      // Verificar role
      const { data: verifyRole, error: roleVerifyError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (roleVerifyError) {
        console.log('⚠️  Aviso: Não foi possível verificar role:', roleVerifyError.message);
      } else if (verifyRole && verifyRole.length > 0) {
        console.log('🔑 Role verificado:');
        verifyRole.forEach(role => {
          console.log(`   - Role: ${role.role}`);
        });
      }

      console.log('\n🎉 Usuário Gilberto Santana criado com sucesso como desenvolvedor!');
      console.log('👤 Nome: Gilberto Santana');
      console.log('📱 Telefone: (85) 99999-9999');
      console.log('🔑 Role: developer');
      console.log('🆔 ID:', userId);

    } else {
      console.error('❌ Usuário não foi encontrado após a criação');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

createGilbertoUser();