-- =====================================================
-- SCRIPT PARA CRIAR TABELA SAVED_REPORTS
-- Execute no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Criar tabela saved_reports
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('leads', 'surveys', 'analytics', 'custom')),
  config JSONB NOT NULL DEFAULT '{}',
  filters JSONB NOT NULL DEFAULT '{}',
  data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_saved_reports_company_id ON public.saved_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON public.saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_type ON public.saved_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_at ON public.saved_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_reports_tags ON public.saved_reports USING GIN(tags);

-- 3. Habilitar RLS
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS

-- Política para SELECT: usuários podem ver relatórios da sua empresa ou públicos
CREATE POLICY "saved_reports_select_policy" ON public.saved_reports
  FOR SELECT USING (
    -- Relatórios públicos
    is_public = true
    OR
    -- Relatórios da própria empresa
    company_id IN (
      SELECT cm.company_id 
      FROM public.company_memberships cm 
      WHERE cm.user_id = auth.uid()
    )
    OR
    -- Relatórios próprios
    user_id = auth.uid()
  );

-- Política para INSERT: usuários autenticados podem criar relatórios
CREATE POLICY "saved_reports_insert_policy" ON public.saved_reports
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND (
      company_id IS NULL 
      OR company_id IN (
        SELECT cm.company_id 
        FROM public.company_memberships cm 
        WHERE cm.user_id = auth.uid()
      )
    )
  );

-- Política para UPDATE: usuários podem atualizar seus próprios relatórios
CREATE POLICY "saved_reports_update_policy" ON public.saved_reports
  FOR UPDATE USING (
    user_id = auth.uid()
    OR
    -- Admins da empresa podem editar relatórios da empresa
    (
      company_id IN (
        SELECT cm.company_id 
        FROM public.company_memberships cm 
        JOIN public.user_roles ur ON ur.user_id = cm.user_id
        WHERE cm.user_id = auth.uid() 
        AND ur.role IN ('admin', 'developer')
      )
    )
  );

-- Política para DELETE: usuários podem deletar seus próprios relatórios
CREATE POLICY "saved_reports_delete_policy" ON public.saved_reports
  FOR DELETE USING (
    user_id = auth.uid()
    OR
    -- Admins da empresa podem deletar relatórios da empresa
    (
      company_id IN (
        SELECT cm.company_id 
        FROM public.company_memberships cm 
        JOIN public.user_roles ur ON ur.user_id = cm.user_id
        WHERE cm.user_id = auth.uid() 
        AND ur.role IN ('admin', 'developer')
      )
    )
  );

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_saved_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar updated_at
CREATE TRIGGER update_saved_reports_updated_at
  BEFORE UPDATE ON public.saved_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saved_reports_updated_at();

-- 7. Criar função para atualizar last_accessed_at
CREATE OR REPLACE FUNCTION public.update_report_access(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.saved_reports 
  SET last_accessed_at = NOW() 
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÕES
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
  'Tabela saved_reports criada' as status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'saved_reports'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  'Políticas RLS criadas' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'saved_reports'
ORDER BY policyname;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Copie todo este script
-- 2. Acesse Supabase Dashboard > SQL Editor
-- 3. Cole e execute o script completo
-- 4. Verifique se não há erros
-- 5. Atualize o hook useReports para usar a tabela
-- =====================================================