-- =====================================================
-- SCRIPT DE VERIFICAÇÃO PÓS-INSTALAÇÃO
-- Execute após criar as tabelas manualmente
-- =====================================================

-- 1. VERIFICAR EXISTÊNCIA DAS TABELAS
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS RLS
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
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename, policyname;

-- 3. VERIFICAR ÍNDICES
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename, indexname;

-- 4. VERIFICAR TRIGGERS
SELECT 
  event_object_schema,
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND event_object_table IN ('companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY event_object_table, trigger_name;

-- 5. VERIFICAR FOREIGN KEYS
SELECT 
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tc.table_name, tc.constraint_name;

-- 6. CONTAR REGISTROS EM CADA TABELA
DO $$
DECLARE
  companies_count INTEGER;
  memberships_count INTEGER;
  leads_count INTEGER;
  surveys_count INTEGER;
  questions_count INTEGER;
  responses_count INTEGER;
BEGIN
  -- Contar registros (com tratamento de erro caso tabela não exista)
  BEGIN
    SELECT COUNT(*) INTO companies_count FROM public.companies;
  EXCEPTION WHEN undefined_table THEN
    companies_count := -1;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO memberships_count FROM public.company_memberships;
  EXCEPTION WHEN undefined_table THEN
    memberships_count := -1;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO leads_count FROM public.leads;
  EXCEPTION WHEN undefined_table THEN
    leads_count := -1;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO surveys_count FROM public.surveys;
  EXCEPTION WHEN undefined_table THEN
    surveys_count := -1;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO questions_count FROM public.survey_questions;
  EXCEPTION WHEN undefined_table THEN
    questions_count := -1;
  END;
  
  BEGIN
    SELECT COUNT(*) INTO responses_count FROM public.survey_responses;
  EXCEPTION WHEN undefined_table THEN
    responses_count := -1;
  END;
  
  -- Exibir resultados
  RAISE NOTICE '=== CONTAGEM DE REGISTROS ===';
  
  IF companies_count >= 0 THEN
    RAISE NOTICE 'Companies: % registros', companies_count;
  ELSE
    RAISE NOTICE 'Companies: TABELA NÃO ENCONTRADA';
  END IF;
  
  IF memberships_count >= 0 THEN
    RAISE NOTICE 'Company Memberships: % registros', memberships_count;
  ELSE
    RAISE NOTICE 'Company Memberships: TABELA NÃO ENCONTRADA';
  END IF;
  
  IF leads_count >= 0 THEN
    RAISE NOTICE 'Leads: % registros', leads_count;
  ELSE
    RAISE NOTICE 'Leads: TABELA NÃO ENCONTRADA';
  END IF;
  
  IF surveys_count >= 0 THEN
    RAISE NOTICE 'Surveys: % registros', surveys_count;
  ELSE
    RAISE NOTICE 'Surveys: TABELA NÃO ENCONTRADA';
  END IF;
  
  IF questions_count >= 0 THEN
    RAISE NOTICE 'Survey Questions: % registros', questions_count;
  ELSE
    RAISE NOTICE 'Survey Questions: TABELA NÃO ENCONTRADA';
  END IF;
  
  IF responses_count >= 0 THEN
    RAISE NOTICE 'Survey Responses: % registros', responses_count;
  ELSE
    RAISE NOTICE 'Survey Responses: TABELA NÃO ENCONTRADA';
  END IF;
  
  RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
END $$;

-- 7. TESTAR INSERÇÃO E SELEÇÃO (APENAS PARA LEADS E SURVEYS)
DO $$
DECLARE
  test_lead_id UUID;
  test_survey_id UUID;
  test_question_id UUID;
BEGIN
  RAISE NOTICE '=== TESTE DE FUNCIONALIDADE ===';
  
  -- Testar inserção de lead
  BEGIN
    INSERT INTO public.leads (name, email, company, status)
    VALUES ('Teste Lead', 'teste@verificacao.com', 'Empresa Teste', 'new')
    RETURNING id INTO test_lead_id;
    
    RAISE NOTICE 'Lead de teste criado com ID: %', test_lead_id;
    
    -- Testar seleção
    IF EXISTS (SELECT 1 FROM public.leads WHERE id = test_lead_id) THEN
      RAISE NOTICE 'Lead de teste encontrado na seleção ✓';
    ELSE
      RAISE NOTICE 'ERRO: Lead de teste não encontrado na seleção ✗';
    END IF;
    
    -- Limpar teste
    DELETE FROM public.leads WHERE id = test_lead_id;
    RAISE NOTICE 'Lead de teste removido ✓';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO ao testar leads: %', SQLERRM;
  END;
  
  -- Testar inserção de survey
  BEGIN
    INSERT INTO public.surveys (title, description, status)
    VALUES ('Survey Teste', 'Descrição do teste', 'draft')
    RETURNING id INTO test_survey_id;
    
    RAISE NOTICE 'Survey de teste criado com ID: %', test_survey_id;
    
    -- Testar inserção de pergunta
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index)
    VALUES (test_survey_id, 'Pergunta de teste?', 'text', 1)
    RETURNING id INTO test_question_id;
    
    RAISE NOTICE 'Pergunta de teste criada com ID: %', test_question_id;
    
    -- Testar seleção com JOIN
    IF EXISTS (
      SELECT 1 
      FROM public.surveys s 
      JOIN public.survey_questions sq ON s.id = sq.survey_id 
      WHERE s.id = test_survey_id AND sq.id = test_question_id
    ) THEN
      RAISE NOTICE 'JOIN entre surveys e questions funcionando ✓';
    ELSE
      RAISE NOTICE 'ERRO: JOIN entre surveys e questions não funcionou ✗';
    END IF;
    
    -- Limpar teste
    DELETE FROM public.survey_questions WHERE id = test_question_id;
    DELETE FROM public.surveys WHERE id = test_survey_id;
    RAISE NOTICE 'Dados de teste removidos ✓';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO ao testar surveys: %', SQLERRM;
  END;
  
  RAISE NOTICE '=== TESTE CONCLUÍDO ===';
END $$;

-- 8. VERIFICAR CONFIGURAÇÃO RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename;

-- 9. FORÇAR RELOAD DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 10. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'VERIFICAÇÃO CONCLUÍDA!';
  RAISE NOTICE 'Revise os resultados acima para confirmar que:';
  RAISE NOTICE '1. Todas as tabelas foram criadas';
  RAISE NOTICE '2. Políticas RLS estão ativas';
  RAISE NOTICE '3. Índices foram criados';
  RAISE NOTICE '4. Triggers estão funcionando';
  RAISE NOTICE '5. Foreign keys estão configuradas';
  RAISE NOTICE '6. Testes de inserção/seleção passaram';
  RAISE NOTICE '================================================';
END $$;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute este script APÓS criar as tabelas
-- 2. Revise todos os resultados das consultas
-- 3. Verifique se não há erros nos logs
-- 4. Confirme que os testes passaram
-- 5. Se tudo estiver OK, as tabelas estão prontas!
-- =====================================================