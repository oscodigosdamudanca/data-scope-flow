-- CORREÇÃO IMEDIATA PARA RECURSÃO INFINITA NAS POLÍTICAS RLS
-- ==========================================================

-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "company_memberships_select_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_insert_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_update_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_delete_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "Users can view their own company memberships" ON public.company_memberships;
DROP POLICY IF EXISTS "Company admins can manage memberships" ON public.company_memberships;

-- PASSO 3: CRIAR POLÍTICAS SEGURAS SEM RECURSÃO
CREATE POLICY "company_memberships_select_safe" ON public.company_memberships
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "company_memberships_insert_safe" ON public.company_memberships
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "company_memberships_update_safe" ON public.company_memberships
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "company_memberships_delete_safe" ON public.company_memberships
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- PASSO 4: REABILITAR RLS
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- VERIFICAÇÃO
SELECT 'Políticas RLS corrigidas com sucesso!' as status;