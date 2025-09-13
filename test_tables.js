// Teste simples para verificar se as tabelas foram recriadas
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Iniciando teste das tabelas...');

const supabaseUrl = 'https://bhjreswsrfvnzyvmxtwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoanJlc3dzcmZ2bnp5dm14dHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU5NTQsImV4cCI6MjA3MzAzMTk1NH0.GR-Paj9yMYnTIhwLISBuG_ycwg1Bz9Vd3bEMChuEUGM';

console.log('📡 Criando cliente Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Cliente Supabase criado com sucesso!');

process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

async function testTables() {
  console.log('🧪 Testando acesso às tabelas após migração...');
  
  // Teste leads
  console.log('\n📋 Testando tabela leads:');
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  
  if (leadsError) {
    console.log('❌ Erro:', leadsError.message);
  } else {
    console.log('✅ Tabela leads acessível!');
  }
  
  // Teste surveys
  console.log('\n📊 Testando tabela surveys:');
  const { data: surveysData, error: surveysError } = await supabase
    .from('surveys')
    .select('*')
    .limit(1);
  
  if (surveysError) {
    console.log('❌ Erro:', surveysError.message);
  } else {
    console.log('✅ Tabela surveys acessível!');
  }
  
  // Teste survey_questions
  console.log('\n❓ Testando tabela survey_questions:');
  const { data: questionsData, error: questionsError } = await supabase
    .from('survey_questions')
    .select('*')
    .limit(1);
  
  if (questionsError) {
    console.log('❌ Erro:', questionsError.message);
  } else {
    console.log('✅ Tabela survey_questions acessível!');
  }
  
  // Teste survey_responses
  console.log('\n💬 Testando tabela survey_responses:');
  const { data: responsesData, error: responsesError } = await supabase
    .from('survey_responses')
    .select('*')
    .limit(1);
  
  if (responsesError) {
    console.log('❌ Erro:', responsesError.message);
  } else {
    console.log('✅ Tabela survey_responses acessível!');
  }
  
  console.log('\n🎉 Teste concluído!');
}

testTables().catch(console.error);