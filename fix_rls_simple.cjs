const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function enableRLSOnTables() {
  console.log('🔐 Verificando status do RLS nas tabelas...\n');
  
  const tables = [
    'companies',
    'company_memberships', 
    'leads',
    'surveys',
    'survey_questions',
    'survey_responses',
    'profiles',
    'user_roles'
  ];

  for (const table of tables) {
    try {
      // Tenta fazer uma consulta simples para verificar se a tabela está acessível
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela '${table}': ${error.message}`);
      } else {
        console.log(`✅ Tabela '${table}': Acessível (${data.length} registros encontrados)`);
      }
    } catch (err) {
      console.log(`⚠️  Tabela '${table}': Erro - ${err.message}`);
    }
  }

  console.log('\n📋 Verificação concluída!');
  console.log('\n⚠️  IMPORTANTE: Para aplicar correções de RLS, é necessário:');
  console.log('1. Acesso ao painel do Supabase Dashboard');
  console.log('2. Ou uma chave de serviço válida');
  console.log('3. Executar os comandos SQL diretamente no SQL Editor do Supabase');
}

enableRLSOnTables().catch(console.error);