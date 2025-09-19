-- =====================================================
-- POLÍTICAS RLS SEGURAS PARA TABELAS QUE DEPENDEM DE COMPANY_MEMBERSHIPS
-- =====================================================
-- 
-- Este script cria políticas RLS seguras para tabelas que anteriormente
-- usavam as funções is_company_admin() e is_company_member() que causavam
-- recursão infinita
-- =====================================================

-- PASSO 1: CORRIGIR POLÍTICAS DA TABELA COMPANIES
-- =====================================================

-- Remover políticas problemáticas de companies
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: delete admin or developer" ON public.companies;

-- Criar políticas seguras para companies
CREATE POLICY "companies_select_safe" ON public.companies
FOR SELECT TO authenticated
USING (
  -- Developer pode ver todas as empresas
  public.has_role(auth.uid(), 'developer')
  OR
  -- Usuário pode ver empresas onde é membro (verificação direta)
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = companies.id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "companies_insert_safe" ON public.companies
FOR INSERT TO authenticated
WITH CHECK (
  -- Qualquer usuário autenticado pode criar uma empresa
  auth.uid() IS NOT NULL
);

CREATE POLICY "companies_update_safe" ON public.companies
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Apenas admins da empresa podem atualizar
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = companies.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = companies.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

CREATE POLICY "companies_delete_safe" ON public.companies
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = companies.id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- PASSO 2: CORRIGIR POLÍTICAS DA TABELA LEADS
-- =====================================================

-- Habilitar RLS na tabela leads se não estiver ativo
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "leads_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_update" ON public.leads;
DROP POLICY IF EXISTS "leads_delete" ON public.leads;

-- Criar políticas seguras para leads
CREATE POLICY "leads_select_safe" ON public.leads
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Usuário pode ver leads da sua empresa
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = leads.company_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "leads_insert_safe" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Membros da empresa podem inserir leads
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = leads.company_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "leads_update_safe" ON public.leads
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = leads.company_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = leads.company_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "leads_delete_safe" ON public.leads
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Apenas admins podem deletar leads
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = leads.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- PASSO 3: CORRIGIR POLÍTICAS DA TABELA SURVEYS
-- =====================================================

-- Habilitar RLS na tabela surveys se não estiver ativo
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "surveys_select" ON public.surveys;
DROP POLICY IF EXISTS "surveys_insert" ON public.surveys;
DROP POLICY IF EXISTS "surveys_update" ON public.surveys;
DROP POLICY IF EXISTS "surveys_delete" ON public.surveys;

-- Criar políticas seguras para surveys
CREATE POLICY "surveys_select_safe" ON public.surveys
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Usuário pode ver surveys da sua empresa
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = surveys.company_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "surveys_insert_safe" ON public.surveys
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'developer')
  OR
  -- Admins da empresa podem criar surveys
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = surveys.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

CREATE POLICY "surveys_update_safe" ON public.surveys
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = surveys.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = surveys.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

CREATE POLICY "surveys_delete_safe" ON public.surveys
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer')
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = surveys.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- PASSO 4: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se RLS está ativo em todas as tabelas
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN 'RLS ATIVO' ELSE 'RLS INATIVO' END as status
FROM pg_tables 
WHERE tablename IN ('companies', 'company_memberships', 'leads', 'surveys')
  AND schemaname = 'public';

-- Contar políticas por tabela
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('companies', 'company_memberships', 'leads', 'surveys')
  AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

SELECT 'Políticas RLS seguras criadas com sucesso!' as status;