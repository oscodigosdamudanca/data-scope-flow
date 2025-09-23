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

async function checkGilbertoUser() {
  console.log('🔍 Verificando usuário Gilberto Santana...\n');

  try {
    // 1. Verificar na tabela auth.users (através de profiles que tem referência)
    console.log('1. Verificando na tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.ilike.%gilberto%, display_name.ilike.%gilberto%, full_name.ilike.%gilberto%');

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError.message);
    } else {
      console.log('📋 Profiles encontrados:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, index) => {
          console.log(`\n   Profile ${index + 1}:`);
          console.log(`   - ID: ${profile.id}`);
          console.log(`   - Email: ${profile.email}`);
          console.log(`   - Display Name: ${profile.display_name}`);
          console.log(`   - Full Name: ${profile.full_name}`);
          console.log(`   - Role: ${profile.role}`);
          console.log(`   - Company ID: ${profile.company_id}`);
          console.log(`   - Created At: ${profile.created_at}`);
          console.log(`   - Updated At: ${profile.updated_at}`);
        });
      }
    }

    // 2. Verificar na tabela companies se Gilberto é admin de alguma empresa
    console.log('\n2. Verificando empresas onde Gilberto pode ser admin...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .or('admin_email.ilike.%gilberto%, admin_name.ilike.%gilberto%');

    if (companiesError) {
      console.error('❌ Erro ao buscar companies:', companiesError.message);
    } else {
      console.log('🏢 Companies encontradas:', companies?.length || 0);
      if (companies && companies.length > 0) {
        companies.forEach((company, index) => {
          console.log(`\n   Company ${index + 1}:`);
          console.log(`   - ID: ${company.id}`);
          console.log(`   - Name: ${company.name}`);
          console.log(`   - Admin Name: ${company.admin_name}`);
          console.log(`   - Admin Email: ${company.admin_email}`);
        });
      }
    }

    // 3. Verificar na tabela company_memberships
    console.log('\n3. Verificando memberships...');
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        const { data: memberships, error: membershipsError } = await supabase
          .from('company_memberships')
          .select('*, companies(*)')
          .eq('user_id', profile.id);

        if (membershipsError) {
          console.error(`❌ Erro ao buscar memberships para ${profile.email}:`, membershipsError.message);
        } else {
          console.log(`👥 Memberships para ${profile.email}:`, memberships?.length || 0);
          if (memberships && memberships.length > 0) {
            memberships.forEach((membership, index) => {
              console.log(`\n   Membership ${index + 1}:`);
              console.log(`   - User ID: ${membership.user_id}`);
              console.log(`   - Company ID: ${membership.company_id}`);
              console.log(`   - Role: ${membership.role}`);
              console.log(`   - Company Name: ${membership.companies?.name}`);
            });
          }
        }
      }
    }

    // 4. Verificar se existe algum usuário com role 'developer'
    console.log('\n4. Verificando usuários com role developer...');
    const { data: developers, error: developersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'developer');

    if (developersError) {
      console.error('❌ Erro ao buscar developers:', developersError.message);
    } else {
      console.log('👨‍💻 Developers encontrados:', developers?.length || 0);
      if (developers && developers.length > 0) {
        developers.forEach((dev, index) => {
          console.log(`\n   Developer ${index + 1}:`);
          console.log(`   - ID: ${dev.id}`);
          console.log(`   - Email: ${dev.email}`);
          console.log(`   - Display Name: ${dev.display_name}`);
          console.log(`   - Full Name: ${dev.full_name}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkGilbertoUser();