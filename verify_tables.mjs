import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são necessárias.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelas() {
  console.log('Verificando tabelas criadas no Supabase...');
  
  // Lista de tabelas a verificar
  const tabelas = [
    'leads',
    'surveys',
    'survey_questions',
    'survey_responses',
    'raffles',
    'raffle_prizes',
    'raffle_participants'
  ];
  
  for (const tabela of tabelas) {
    try {
      // Verificar se a tabela existe consultando seus metadados
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Tabela ${tabela}: Não existe ou não está acessível`);
        } else {
          console.log(`❌ Tabela ${tabela}: Erro ao verificar - ${error.message}`);
        }
      } else {
        console.log(`✅ Tabela ${tabela}: Existe e está acessível`);
      }
    } catch (err) {
      console.log(`❌ Tabela ${tabela}: Erro ao verificar - ${err.message}`);
    }
  }
  
  console.log('Verificação concluída!');
}

verificarTabelas();