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
    // Dados do usuário Gilberto Santana
    const gilbertoData = {
      id: crypto.randomUUID(), // Gerar um UUID único
      display_name: 'Gilberto Santana',
      full_name: 'Gilberto Santana',
      email: 'gilberto.santana@datascopeanalytics.com',
      role: 'developer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📋 Dados do usuário a ser criado:');
    Object.keys(gilbertoData).forEach(key => {
      console.log(`   - ${key}: ${gilbertoData[key]}`);
    });

    // 1. Inserir o usuário na tabela profiles
    console.log('\n1. Inserindo usuário na tabela profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([gilbertoData])
      .select();

    if (profileError) {
      console.error('❌ Erro ao inserir profile:', profileError.message);
      console.error('Detalhes do erro:', profileError);
      return;
    }

    console.log('✅ Profile criado com sucesso!');
    console.log('📊 Dados inseridos:', profileData);

    // 2. Verificar se o usuário foi criado corretamente
    console.log('\n2. Verificando se o usuário foi criado...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', gilbertoData.email);

    if (verifyError) {
      console.error('❌ Erro ao verificar usuário:', verifyError.message);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      console.log('✅ Usuário verificado com sucesso!');
      console.log('👨‍💻 Dados do desenvolvedor:');
      const user = verifyData[0];
      Object.keys(user).forEach(key => {
        console.log(`   - ${key}: ${user[key]}`);
      });

      // 3. Criar uma empresa exemplo para o desenvolvedor (opcional)
      console.log('\n3. Criando empresa exemplo para o desenvolvedor...');
      const companyData = {
        id: crypto.randomUUID(),
        name: 'DataScope Analytics',
        cnpj: '00.000.000/0001-00',
        email: 'contato@datascopeanalytics.com',
        phone: '(85) 99999-9999',
        address: 'Fortaleza, CE',
        logo_url: null,
        is_active: true,
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
          user_id: gilbertoData.id,
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

      console.log('\n🎉 Usuário Gilberto Santana criado com sucesso como desenvolvedor!');
      console.log('📧 Email:', gilbertoData.email);
      console.log('👤 Nome completo:', gilbertoData.full_name);
      console.log('🔑 Role:', gilbertoData.role);
      console.log('🆔 ID:', gilbertoData.id);

    } else {
      console.error('❌ Usuário não foi encontrado após a criação');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

createGilbertoUser();