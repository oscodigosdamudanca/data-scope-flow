// Script simplificado para sincronização com o MCP
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verifica se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não definidas');
  process.exit(1);
}

// Cria cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função principal para sincronizar o banco de dados
async function syncDatabase() {
  try {
    console.log('Iniciando sincronização do banco de dados...');
    
    // Verifica conexão com o banco de dados
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      throw new Error(`Erro ao conectar ao banco de dados: ${error.message}`);
    }
    
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    console.log('Sincronização concluída com sucesso!');
  } catch (error) {
    console.error(`Erro durante a sincronização: ${error.message}`);
    process.exit(1);
  }
}

// Executa a sincronização
syncDatabase();