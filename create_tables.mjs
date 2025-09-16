import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

// Criar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessários no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Ler o conteúdo do arquivo SQL
const leadsSetupSQL = fs.readFileSync('./leads_surveys_only_setup.sql', 'utf8');
const rafflesSetupSQL = fs.readFileSync('./supabase/migrations/raffles_setup.sql', 'utf8');

// Função para executar SQL
async function executeSQLScript(sql) {
  // Dividir o script em comandos individuais
  const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
  
  for (const command of commands) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: command });
      if (error) {
        console.error('Erro ao executar comando SQL:', error);
        console.error('Comando:', command);
      }
    } catch (err) {
      console.error('Erro ao executar comando SQL:', err);
      console.error('Comando:', command);
    }
  }
}

// Função principal
async function createTables() {
  console.log('Iniciando criação de tabelas...');
  
  // Verificar se as tabelas já existem
  const { data: leadsTable, error: leadsError } = await supabase
    .from('leads')
    .select('id')
    .limit(1);
  
  if (leadsError) {
    console.log('Tabela leads não existe, criando...');
    await executeSQLScript(leadsSetupSQL);
  } else {
    console.log('Tabela leads já existe.');
  }
  
  const { data: rafflesTable, error: rafflesError } = await supabase
    .from('raffles')
    .select('id')
    .limit(1);
  
  if (rafflesError) {
    console.log('Tabela raffles não existe, criando...');
    await executeSQLScript(rafflesSetupSQL);
  } else {
    console.log('Tabela raffles já existe.');
  }
  
  // Verificar se as tabelas foram criadas
  const tables = ['leads', 'surveys', 'survey_questions', 'survey_responses', 'raffles', 'raffle_prizes', 'raffle_participants'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(1);
    
    console.log(`Tabela ${table}: ${error ? 'Não criada' : 'Criada com sucesso'}`);
  }
  
  console.log('Processo de criação de tabelas concluído.');
}

// Executar função principal
createTables().catch(err => {
  console.error('Erro na execução:', err);
});