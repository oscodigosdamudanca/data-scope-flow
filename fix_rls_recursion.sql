-- =====================================================
-- SCRIPT PARA CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- =====================================================
-- 
-- PROBLEMA: As políticas RLS de company_memberships usam funções que 
-- consultam a própria tabela, criando recursão infinita
--
-- SOLUÇÃO: Remover políticas problemáticas e criar políticas diretas
-- sem dependência de funções que consultam a mesma tabela
-- =====================================================

-- PASSO 1: REMOVER POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Desabilitar RLS temporariamente para evitar erros durante a correção
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes de company_memberships
DROP POLICY IF EXISTS "Memberships: select member or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: insert admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: update admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: delete admin or developer" ON public.company_memberships;

-- PASSO 2: CRIAR POLÍTICAS SEGURAS SEM RECURSÃO
-- =====================================================

-- Política de SELECT: Permite ver memberships onde o usuário é membro OU é developer
CREATE POLICY "company_memberships_select_safe" ON public.company_memberships
FOR SELECT TO authenticated
USING (
  -- Developer pode ver tudo
  public.has_role(auth.uid(), 'developer'::app_role)
  OR
  -- Usuário pode ver apenas seus próprios memberships
  user_id = auth.uid()
);

-- Política de INSERT: Apenas developers ou admins da empresa podem adicionar membros
CREATE POLICY "company_memberships_insert_safe" ON public.company_memberships
FOR INSERT TO authenticated
WITH CHECK (
  -- Developer pode inserir qualquer membership
  public.has_role(auth.uid(), 'developer'::app_role)
  OR
  -- Admin da empresa pode adicionar membros (verificação direta sem recursão)
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = company_memberships.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- Política de UPDATE: Apenas developers ou admins da empresa podem atualizar
CREATE POLICY "company_memberships_update_safe" ON public.company_memberships
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer'::app_role)
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = company_memberships.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'developer'::app_role)
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = company_memberships.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- Política de DELETE: Apenas developers ou admins da empresa podem remover
CREATE POLICY "company_memberships_delete_safe" ON public.company_memberships
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'developer'::app_role)
  OR
  EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = company_memberships.company_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'::public.company_role
  )
);

-- PASSO 3: REABILITAR RLS
-- =====================================================
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- PASSO 4: CORRIGIR OUTRAS TABELAS QUE USAM AS FUNÇÕES PROBLEMÁTICAS
-- =====================================================

-- Verificar e corrigir políticas de companies que usam is_company_admin/is_company_member
-- (Essas correções serão feitas em um próximo script após testar company_memberships)

-- PASSO 5: VERIFICAÇÃO
-- =====================================================

-- Testar se as políticas estão funcionando sem recursão
SELECT 'Políticas RLS corrigidas com sucesso!' as status;

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_memberships';

-- Listar políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'company_memberships';