-- Script para alinhar a estrutura do banco de dados com o PRD
-- Remove estruturas não previstas e ajusta as existentes

-- 1. Remover tabelas não previstas no PRD
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.business_intelligence_configs CASCADE;

-- 2. Ajustar a tabela de sorteios (raffles) para suportar múltiplos prêmios conforme PRD
-- Primeiro, remover a coluna winner_id que não suporta múltiplos prêmios
ALTER TABLE public.raffles DROP COLUMN IF EXISTS winner_id;
ALTER TABLE public.raffles DROP COLUMN IF EXISTS prize_description;

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

-- Adicionar configuração para participação contínua após ser sorteado
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS allow_multiple_wins BOOLEAN DEFAULT false;

-- Adicionar suporte para compartilhamento em redes sociais
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS social_sharing_enabled BOOLEAN DEFAULT true;

-- 3. Simplificar estrutura de feedback conforme PRD
-- Manter apenas a tabela fair_feedback que está alinhada com o PRD
-- e remover a tabela feedback genérica que não está no PRD
DROP TABLE IF EXISTS public.feedback CASCADE;

-- 4. Ajustar a tabela de perguntas de pesquisa para usar os tipos de perguntas do desenvolvedor
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS question_type_id UUID REFERENCES question_types(id);

-- 5. Adicionar campo de consentimento LGPD para leads conforme PRD
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lgpd_consent BOOLEAN DEFAULT false;

-- 6. Criar índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_raffle_prizes_raffle_id ON raffle_prizes(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_prizes_order ON raffle_prizes(prize_order);
CREATE INDEX IF NOT EXISTS idx_fair_feedback_category ON fair_feedback(category);
CREATE INDEX IF NOT EXISTS idx_fair_feedback_rating ON fair_feedback(rating);

-- 7. Habilitar RLS nas novas tabelas
ALTER TABLE public.raffle_prizes ENABLE ROW LEVEL SECURITY;

-- 8. Criar triggers para updated_at nas novas tabelas
CREATE TRIGGER update_raffle_prizes_updated_at
    BEFORE UPDATE ON raffle_prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();