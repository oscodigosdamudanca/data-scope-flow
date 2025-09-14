-- Script para corrigir políticas RLS e permitir operações CRUD
-- Execute este script no painel SQL do Supabase

-- Remove políticas existentes que podem estar muito restritivas
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;
DROP POLICY IF EXISTS "leads_update_policy" ON leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON leads;

DROP POLICY IF EXISTS "surveys_select_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_insert_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_update_policy" ON surveys;
DROP POLICY IF EXISTS "surveys_delete_policy" ON surveys;

DROP POLICY IF EXISTS "survey_questions_select_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_insert_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_update_policy" ON survey_questions;
DROP POLICY IF EXISTS "survey_questions_delete_policy" ON survey_questions;

DROP POLICY IF EXISTS "survey_responses_select_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_insert_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_update_policy" ON survey_responses;
DROP POLICY IF EXISTS "survey_responses_delete_policy" ON survey_responses;

-- Políticas permissivas para desenvolvimento (LEADS)
CREATE POLICY "leads_select_policy" ON leads
    FOR SELECT USING (true);

CREATE POLICY "leads_insert_policy" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update_policy" ON leads
    FOR UPDATE USING (true);

CREATE POLICY "leads_delete_policy" ON leads
    FOR DELETE USING (true);

-- Políticas permissivas para desenvolvimento (SURVEYS)
CREATE POLICY "surveys_select_policy" ON surveys
    FOR SELECT USING (true);

CREATE POLICY "surveys_insert_policy" ON surveys
    FOR INSERT WITH CHECK (true);

CREATE POLICY "surveys_update_policy" ON surveys
    FOR UPDATE USING (true);

CREATE POLICY "surveys_delete_policy" ON surveys
    FOR DELETE USING (true);

-- Políticas permissivas para desenvolvimento (SURVEY_QUESTIONS)
CREATE POLICY "survey_questions_select_policy" ON survey_questions
    FOR SELECT USING (true);

CREATE POLICY "survey_questions_insert_policy" ON survey_questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "survey_questions_update_policy" ON survey_questions
    FOR UPDATE USING (true);

CREATE POLICY "survey_questions_delete_policy" ON survey_questions
    FOR DELETE USING (true);

-- Políticas permissivas para desenvolvimento (SURVEY_RESPONSES)
CREATE POLICY "survey_responses_select_policy" ON survey_responses
    FOR SELECT USING (true);

CREATE POLICY "survey_responses_insert_policy" ON survey_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "survey_responses_update_policy" ON survey_responses
    FOR UPDATE USING (true);

CREATE POLICY "survey_responses_delete_policy" ON survey_responses
    FOR DELETE USING (true);

-- Inserir alguns dados de exemplo para teste
INSERT INTO leads (name, email, phone, status) 
SELECT 'João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'new'
WHERE NOT EXISTS (
    SELECT 1 FROM leads WHERE email = 'joao.silva@email.com'
);

INSERT INTO leads (name, email, phone, status) 
SELECT 'Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'contacted'
WHERE NOT EXISTS (
    SELECT 1 FROM leads WHERE email = 'maria.santos@email.com'
);

INSERT INTO surveys (title, description, status) 
SELECT 'Pesquisa de Satisfação', 'Avaliação da experiência do cliente', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM surveys WHERE title = 'Pesquisa de Satisfação'
);

INSERT INTO surveys (title, description, status) 
SELECT 'Feedback do Produto', 'Coleta de opiniões sobre nossos produtos', 'draft'
WHERE NOT EXISTS (
    SELECT 1 FROM surveys WHERE title = 'Feedback do Produto'
);

-- Inserir perguntas de exemplo
INSERT INTO survey_questions (survey_id, question_text, question_type, is_required, order_index)
SELECT 
    s.id,
    'Como você avalia nosso atendimento?',
    'multiple_choice',
    true,
    1
FROM surveys s 
WHERE s.title = 'Pesquisa de Satisfação'
AND NOT EXISTS (
    SELECT 1 FROM survey_questions sq 
    WHERE sq.survey_id = s.id AND sq.question_text = 'Como você avalia nosso atendimento?'
);

INSERT INTO survey_questions (survey_id, question_text, question_type, is_required, order_index)
SELECT 
    s.id,
    'Deixe seus comentários adicionais:',
    'text',
    false,
    2
FROM surveys s 
WHERE s.title = 'Pesquisa de Satisfação'
AND NOT EXISTS (
    SELECT 1 FROM survey_questions sq 
    WHERE sq.survey_id = s.id AND sq.question_text = 'Deixe seus comentários adicionais:'
);

-- Verificações finais
SELECT 'Verificação de dados inseridos:' as status;
SELECT 'Leads:' as tabela, COUNT(*) as total FROM leads;
SELECT 'Surveys:' as tabela, COUNT(*) as total FROM surveys;
SELECT 'Survey Questions:' as tabela, COUNT(*) as total FROM survey_questions;
SELECT 'Survey Responses:' as tabela, COUNT(*) as total FROM survey_responses;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename, policyname;

SELECT 'Script executado com sucesso! ✅' as resultado;