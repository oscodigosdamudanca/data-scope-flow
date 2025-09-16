-- Script para criar as tabelas faltantes no banco de dados
-- Data: 16/09/2025

-- Criar tabela sorteios (raffles)
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    prize_description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    winner_id UUID REFERENCES leads(id),
    drawn_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES profiles(id),
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

-- Criar tabela leads se não existir
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    lgpd_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID -- Referência ao usuário que criou o lead
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_raffles_company_id ON public.raffles(company_id);
CREATE INDEX IF NOT EXISTS idx_raffles_is_active ON public.raffles(is_active);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON public.raffle_participants(raffle_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela sorteios
CREATE POLICY "Raffles: select for authenticated users" ON public.raffles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffles: insert for authenticated users" ON public.raffles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffles: update for authenticated users" ON public.raffles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffles: delete for authenticated users" ON public.raffles
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

-- Criar políticas RLS para a tabela leads
CREATE POLICY "Leads: select for authenticated users" ON public.leads
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leads: insert for authenticated users" ON public.leads
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Leads: update for authenticated users" ON public.leads
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leads: delete for authenticated users" ON public.leads
    FOR DELETE TO authenticated USING (true);

-- Criar trigger para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas
CREATE TRIGGER update_raffles_updated_at
    BEFORE UPDATE ON public.raffles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conceder permissões para acessar pg_tables (necessário para geração de tipos TypeScript)
GRANT SELECT ON pg_tables TO authenticated;
GRANT SELECT ON pg_type TO authenticated;
GRANT SELECT ON pg_attribute TO authenticated;
GRANT SELECT ON pg_class TO authenticated;
GRANT SELECT ON pg_namespace TO authenticated;
GRANT SELECT ON pg_constraint TO authenticated;