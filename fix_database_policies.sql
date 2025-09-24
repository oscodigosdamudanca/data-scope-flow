-- =====================================================
-- SCRIPT DE CORREÇÃO E OTIMIZAÇÃO DO BANCO DE DADOS
-- DataScope Flow - Correção de Políticas RLS
-- =====================================================

-- 1. REMOVER POLÍTICAS DUPLICADAS E CONFLITANTES
-- =====================================================

-- Tabela: leads - Remover políticas duplicadas
DROP POLICY IF EXISTS "leads_delete_policy" ON leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
DROP POLICY IF EXISTS "leads_update_policy" ON leads;

-- Tabela: surveys - Remover políticas duplicadas
DROP POLICY IF EXISTS "surveys_delete_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_insert_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_select_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_update_policy" ON surveys;

-- Tabela: survey_questions - Remover políticas duplicadas
DROP POLICY IF EXISTS "survey_questions_delete_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_insert_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_select_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_update_policy" ON survey_questions;

-- Tabela: survey_responses - Remover políticas duplicadas
DROP POLICY IF EXISTS "survey_responses_delete_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_insert_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_select_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_update_policy" ON survey_responses;

-- 2. CRIAR POLÍTICAS RLS OTIMIZADAS E CONSISTENTES
-- =====================================================

-- TABELA: leads
-- Política para visualização: usuários podem ver leads de suas empresas
CREATE POLICY "leads_select_company_members" ON leads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id IN (
                SELECT cm2.company_id 
                FROM company_memberships cm2 
                WHERE cm2.user_id = leads.created_by
            )
        )
    );

-- Política para inserção: usuários autenticados podem inserir leads
CREATE POLICY "leads_insert_authenticated" ON leads
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Política para atualização: usuários podem atualizar leads de suas empresas
CREATE POLICY "leads_update_company_members" ON leads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id IN (
                SELECT cm2.company_id 
                FROM company_memberships cm2 
                WHERE cm2.user_id = leads.created_by
            )
        )
    );

-- Política para exclusão: apenas administradores e desenvolvedores
CREATE POLICY "leads_delete_admin_dev" ON leads
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.app_role IN ('admin', 'developer')
        )
    );

-- TABELA: surveys
-- Manter apenas as políticas baseadas em company_memberships (mais restritivas e seguras)

-- TABELA: survey_questions
-- Manter apenas as políticas baseadas em company_memberships (mais restritivas e seguras)

-- TABELA: survey_responses
-- Manter política de inserção pública, mas restringir visualização
CREATE POLICY "survey_responses_select_company_members" ON survey_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM surveys s
            JOIN company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_responses.survey_id
            AND cm.user_id = auth.uid()
        )
    );

-- 3. ADICIONAR ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices para otimizar consultas de company_memberships
CREATE INDEX IF NOT EXISTS idx_company_memberships_user_company 
ON company_memberships(user_id, company_id);

CREATE INDEX IF NOT EXISTS idx_company_memberships_company_user 
ON company_memberships(company_id, user_id);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);

-- Índices para survey_questions
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(question_order);

-- Índices para survey_responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON survey_responses(question_id);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_app_role ON profiles(app_role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Índices para raffles
CREATE INDEX IF NOT EXISTS idx_raffles_company_id ON raffles(company_id);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);

-- Índices para raffle_participants
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_lead_id ON raffle_participants(lead_id);

-- 4. VERIFICAR E CORRIGIR CONSTRAINTS
-- =====================================================

-- Verificar se todas as foreign keys estão corretas
-- Adicionar constraint para garantir que created_by em leads seja válido
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'leads_created_by_fkey'
    ) THEN
        ALTER TABLE leads 
        ADD CONSTRAINT leads_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. ATUALIZAR TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas que têm updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se RLS está habilitado em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_prizes ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE leads IS 'Tabela de leads captados pelos expositores';
COMMENT ON TABLE surveys IS 'Tabela de pesquisas criadas pelas empresas';
COMMENT ON TABLE survey_questions IS 'Perguntas das pesquisas';
COMMENT ON TABLE survey_responses IS 'Respostas às pesquisas';
COMMENT ON TABLE raffles IS 'Sorteios realizados pelas empresas';
COMMENT ON TABLE raffle_participants IS 'Participantes dos sorteios';
COMMENT ON TABLE raffle_prizes IS 'Prêmios dos sorteios';

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================

-- Para executar este script:
-- 1. Copie todo o conteúdo
-- 2. Cole no SQL Editor do Supabase Dashboard
-- 3. Execute o script completo
-- 4. Verifique se não há erros no console