import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhjreswsrfvnzyvmxtwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoanJlc3dzcmZ2bnp5dm14dHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU5NTQsImV4cCI6MjA3MzAzMTk1NH0.GR-Paj9yMYnTIhwLISBuG_ycwg1Bz9Vd3bEMChuEUGM';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testando conexão com Supabase...');

async function testTables() {
  const tables = ['leads', 'surveys', 'survey_questions', 'survey_responses'];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Testando tabela: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro na tabela ${table}:`, error.message);
        console.log(`   Código do erro:`, error.code);
      } else {
        console.log(`✅ Tabela ${table} acessível. Registros: ${data?.length || 0}`);
      }
    } catch (err) {
      console.log(`💥 Exceção na tabela ${table}:`, err.message);
    }
  }
}

testTables().then(() => {
  console.log('\n🏁 Teste concluído!');
}).catch(err => {
  console.error('💥 Erro geral:', err);
});