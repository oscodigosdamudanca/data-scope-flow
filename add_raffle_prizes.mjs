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
  console.log('Criando tabela raffle_prizes...');
  
  const sql = `
  -- Tabela de prêmios do sorteio
  CREATE TABLE IF NOT EXISTS public.raffle_prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    winner_id UUID REFERENCES public.raffle_participants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Índices para raffle_prizes
  CREATE INDEX IF NOT EXISTS idx_raffle_prizes_raffle_id ON public.raffle_prizes(raffle_id);
  CREATE INDEX IF NOT EXISTS idx_raffle_prizes_winner_id ON public.raffle_prizes(winner_id);
  
  -- Habilitar RLS
  ALTER TABLE public.raffle_prizes ENABLE ROW LEVEL SECURITY;
  
  -- Políticas RLS para raffle_prizes
  CREATE POLICY "raffle_prizes_full_access" ON public.raffle_prizes
    FOR ALL TO authenticated 
    USING (true)
    WITH CHECK (true);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Erro ao criar tabela raffle_prizes:', error.message);
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