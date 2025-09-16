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

async function criarTabelaRafflePrizes() {
  console.log('Verificando conexão com o Supabase...');
  
  try {
    // Verificar se a tabela raffle_prizes já existe
    const { data: existingData, error: tableError } = await supabase
      .from('raffle_prizes')
      .select('id')
      .limit(1);
    
    if (!tableError && existingData && existingData.length > 0) {
      console.log('✅ A tabela raffle_prizes já existe no banco de dados.');
      return;
    }
    
    console.log('Criando tabela raffle_prizes...');
    
    // Criar a tabela usando insert direto
    const { error } = await supabase
      .from('raffle_prizes')
      .insert([
        { 
          raffle_id: '00000000-0000-0000-0000-000000000000',
          name: 'Prêmio Teste',
          description: 'Prêmio para teste inicial',
          position: 1
        }
      ]);
    
    if (error) {
      console.error('Erro ao criar registro na tabela raffle_prizes:', error.message);
    } else {
      console.log('✅ Tabela raffle_prizes criada com sucesso!');
    }
    
    // Verificar se a tabela foi criada
    const { data, error: checkError } = await supabase
      .from('raffle_prizes')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log(`❌ Verificação: Tabela raffle_prizes não está acessível - ${checkError.message}`);
    } else {
      console.log('✅ Verificação: Tabela raffle_prizes existe e está acessível');
    }
  } catch (err) {
    console.error('Erro inesperado:', err.message);
  }
}

criarTabelaRafflePrizes();