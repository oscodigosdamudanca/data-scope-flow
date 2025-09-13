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

async function testRemoteTables() {
  console.log('🔍 Testando conectividade com o banco remoto...');
  
  // Teste 1: Verificar se as tabelas existem consultando o information_schema
  console.log('\n📋 Verificando tabelas no information_schema...');
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['leads', 'surveys', 'survey_questions', 'survey_responses']);
    
    if (error) {
      console.error('❌ Erro ao consultar information_schema:', error.message);
    } else {
      console.log('✅ Tabelas encontradas no information_schema:', data?.map(t => t.table_name) || []);
    }
  } catch (err) {
    console.error('❌ Erro na consulta information_schema:', err.message);
  }

  // Teste 2: Tentar consultar cada tabela diretamente
  const tables = ['leads', 'surveys', 'survey_questions', 'survey_responses'];
  
  for (const table of tables) {
    console.log(`\n🔍 Testando tabela: ${table}`);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro na tabela ${table}:`, error.message, `(Código: ${error.code})`);
      } else {
        console.log(`✅ Tabela ${table} acessível. Registros encontrados: ${data?.length || 0}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao acessar ${table}:`, err.message);
    }
  }

  // Teste 3: Verificar políticas RLS
  console.log('\n🔒 Verificando políticas RLS...');
  try {
    const { data, error } = await supabase.rpc('pg_policies');
    if (error) {
      console.log('ℹ️ Não foi possível verificar políticas RLS via RPC');
    } else {
      console.log('✅ Políticas RLS verificadas');
    }
  } catch (err) {
    console.log('ℹ️ Verificação de políticas RLS não disponível');
  }

  console.log('\n✅ Teste concluído!');
}

testRemoteTables().catch(console.error);