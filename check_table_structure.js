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

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas...\n');

  try {
    // 1. Listar todas as tabelas disponíveis
    console.log('1. Listando tabelas disponíveis...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list');

    if (tablesError) {
      console.log('❌ Erro ao listar tabelas via RPC, tentando método alternativo...');
      
      // Tentar listar tabelas conhecidas
      const knownTables = ['profiles', 'companies', 'company_memberships', 'leads', 'surveys'];
      
      for (const tableName of knownTables) {
        console.log(`\n📋 Verificando tabela: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Tabela ${tableName} não existe ou não acessível: ${error.message}`);
        } else {
          console.log(`   ✅ Tabela ${tableName} existe e é acessível`);
          
          // Se conseguiu acessar, vamos ver a estrutura dos dados
          if (data && data.length > 0) {
            console.log(`   📊 Exemplo de dados (primeiro registro):`);
            const firstRecord = data[0];
            Object.keys(firstRecord).forEach(key => {
              console.log(`      - ${key}: ${typeof firstRecord[key]} (${firstRecord[key]})`);
            });
          } else {
            console.log(`   📊 Tabela vazia`);
          }
        }
      }
    } else {
      console.log('✅ Tabelas encontradas:', tables);
    }

    // 2. Verificar especificamente a tabela profiles
    console.log('\n2. Verificando estrutura da tabela profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log(`❌ Erro ao acessar profiles: ${profilesError.message}`);
    } else {
      console.log(`✅ Profiles encontrados: ${profilesData?.length || 0}`);
      if (profilesData && profilesData.length > 0) {
        console.log('📊 Estrutura da tabela profiles:');
        const firstProfile = profilesData[0];
        Object.keys(firstProfile).forEach(key => {
          console.log(`   - ${key}: ${typeof firstProfile[key]}`);
        });
        
        console.log('\n📋 Todos os profiles:');
        profilesData.forEach((profile, index) => {
          console.log(`   Profile ${index + 1}:`);
          Object.keys(profile).forEach(key => {
            console.log(`      ${key}: ${profile[key]}`);
          });
          console.log('');
        });
      }
    }

    // 3. Verificar tabela companies
    console.log('\n3. Verificando estrutura da tabela companies...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (companiesError) {
      console.log(`❌ Erro ao acessar companies: ${companiesError.message}`);
    } else {
      console.log(`✅ Companies encontradas: ${companiesData?.length || 0}`);
      if (companiesData && companiesData.length > 0) {
        console.log('📊 Estrutura da tabela companies:');
        const firstCompany = companiesData[0];
        Object.keys(firstCompany).forEach(key => {
          console.log(`   - ${key}: ${typeof firstCompany[key]}`);
        });
        
        console.log('\n📋 Todas as companies:');
        companiesData.forEach((company, index) => {
          console.log(`   Company ${index + 1}:`);
          Object.keys(company).forEach(key => {
            console.log(`      ${key}: ${company[key]}`);
          });
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkTableStructure();