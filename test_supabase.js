import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Obtém as credenciais do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verifica se as credenciais estão disponíveis
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no arquivo .env');
  process.exit(1);
}

// Cria o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    // Tenta fazer uma consulta simples para verificar a conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    console.log('Dados recebidos:', data);
    
    // Verifica outras tabelas principais
    const tables = ['sorteios', 'leads'];
    for (const table of tables) {
      console.log(`Verificando tabela '${table}'...`);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('count()')
        .limit(1);
      
      if (tableError) {
        console.warn(`⚠️ Aviso: Não foi possível acessar a tabela '${table}': ${tableError.message}`);
      } else {
        console.log(`✅ Tabela '${table}' acessível. Contagem: ${tableData[0]?.count || 0}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o Supabase:', error.message);
    process.exit(1);
  }
}

// Executa o teste
testSupabaseConnection();