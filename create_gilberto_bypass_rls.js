import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

dotenv.config();

// Usar a service_role key para contornar RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Precisa ser adicionada ao .env

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variáveis de ambiente necessárias não encontradas:');
    console.error('   - VITE_SUPABASE_URL:', !!supabaseUrl);
    console.error('   - SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
    console.error('\n💡 Adicione a SUPABASE_SERVICE_ROLE_KEY ao arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createGilbertoUser() {
    console.log('👨‍💻 Criando usuário Gilberto Santana como desenvolvedor (usando service_role)...\n');

    const gilbertoId = 'c38ddc95-4fd9-46d0-9353-d42a7be80bba';
    const companyId = randomUUID();

    try {
        // 1. Inserir o profile
        console.log('1. Inserindo usuário na tabela profiles...');
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: gilbertoId,
                display_name: 'Gilberto Santana',
                phone: '(85) 99999-9999',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select();

        if (profileError) {
            console.error('❌ Erro ao inserir profile:', profileError.message);
            console.error('Detalhes do erro:', profileError);
            return;
        }

        console.log('✅ Profile criado com sucesso:', profileData);

        // 2. Inserir o role de desenvolvedor
        console.log('\n2. Inserindo role de desenvolvedor...');
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .upsert({
                user_id: gilbertoId,
                role: 'developer',
                created_at: new Date().toISOString()
            })
            .select();

        if (roleError) {
            console.error('❌ Erro ao inserir role:', roleError.message);
            console.error('Detalhes do erro:', roleError);
            return;
        }

        console.log('✅ Role de desenvolvedor criado com sucesso:', roleData);

        // 3. Criar empresa exemplo
        console.log('\n3. Criando empresa exemplo...');
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
                id: companyId,
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
            })
            .select();

        if (companyError) {
            console.error('❌ Erro ao criar empresa:', companyError.message);
            console.error('Detalhes do erro:', companyError);
            return;
        }

        console.log('✅ Empresa criada com sucesso:', companyData);

        // 4. Criar membership
        console.log('\n4. Criando membership...');
        const { data: membershipData, error: membershipError } = await supabase
            .from('company_memberships')
            .insert({
                user_id: gilbertoId,
                company_id: companyId,
                role: 'admin',
                created_at: new Date().toISOString()
            })
            .select();

        if (membershipError) {
            console.error('❌ Erro ao criar membership:', membershipError.message);
            console.error('Detalhes do erro:', membershipError);
            return;
        }

        console.log('✅ Membership criado com sucesso:', membershipData);

        // 5. Verificação final
        console.log('\n=== VERIFICAÇÃO FINAL ===');
        
        // Verificar profile
        const { data: profileCheck } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', gilbertoId)
            .single();

        console.log('👤 Profile encontrado:', profileCheck);

        // Verificar role
        const { data: roleCheck } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', gilbertoId)
            .eq('role', 'developer')
            .single();

        console.log('🔑 Role encontrado:', roleCheck);

        // Verificar empresa
        const { data: companyCheck } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        console.log('🏢 Empresa encontrada:', companyCheck);

        // Verificar membership
        const { data: membershipCheck } = await supabase
            .from('company_memberships')
            .select('*')
            .eq('user_id', gilbertoId)
            .eq('company_id', companyId)
            .single();

        console.log('🤝 Membership encontrado:', membershipCheck);

        console.log('\n🎉 Usuário Gilberto Santana criado com sucesso como desenvolvedor!');
        console.log(`📋 Dados principais:`);
        console.log(`   - ID: ${gilbertoId}`);
        console.log(`   - Nome: Gilberto Santana`);
        console.log(`   - Telefone: (85) 99999-9999`);
        console.log(`   - Role: developer`);
        console.log(`   - Empresa: DataScope Analytics (ID: ${companyId})`);

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

createGilbertoUser();