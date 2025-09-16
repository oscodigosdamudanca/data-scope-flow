-- Script para criar as tabelas de sorteios (raffles)
-- Data: Atual

-- Criar tabela sorteios (raffles)
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    allow_multiple_wins BOOLEAN DEFAULT false,
    social_sharing_enabled BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de prêmios para suportar múltiplos prêmios por sorteio
CREATE TABLE IF NOT EXISTS public.raffle_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    prize_name TEXT NOT NULL,
    prize_description TEXT,
    prize_order INTEGER NOT NULL, -- 1º, 2º, 3º lugar, etc.
    winner_id UUID REFERENCES leads(id),
    drawn_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de participantes do sorteio
CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(raffle_id, lead_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_raffles_company_id ON public.raffles(company_id);
CREATE INDEX IF NOT EXISTS idx_raffles_is_active ON public.raffles(is_active);
CREATE INDEX IF NOT EXISTS idx_raffle_prizes_raffle_id ON public.raffle_prizes(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON public.raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_lead_id ON public.raffle_participants(lead_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela sorteios
CREATE POLICY "Raffles: select for authenticated users" ON public.raffles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffles: insert for authenticated users" ON public.raffles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffles: update for authenticated users" ON public.raffles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffles: delete for authenticated users" ON public.raffles
    FOR DELETE TO authenticated USING (true);

-- Criar políticas RLS para a tabela de prêmios
CREATE POLICY "Raffle prizes: select for authenticated users" ON public.raffle_prizes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffle prizes: insert for authenticated users" ON public.raffle_prizes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffle prizes: update for authenticated users" ON public.raffle_prizes
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffle prizes: delete for authenticated users" ON public.raffle_prizes
    FOR DELETE TO authenticated USING (true);

-- Criar políticas RLS para a tabela participantes do sorteio
CREATE POLICY "Raffle participants: select for authenticated users" ON public.raffle_participants
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffle participants: insert for authenticated users" ON public.raffle_participants
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffle participants: update for authenticated users" ON public.raffle_participants
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffle participants: delete for authenticated users" ON public.raffle_participants
    FOR DELETE TO authenticated USING (true);

-- Criar trigger para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_raffles_updated_at
BEFORE UPDATE ON public.raffles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raffle_prizes_updated_at
BEFORE UPDATE ON public.raffle_prizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();