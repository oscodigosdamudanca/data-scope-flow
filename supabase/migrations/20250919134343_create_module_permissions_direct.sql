-- Criar tabela module_permissions
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_type TEXT NOT NULL CHECK (role_type IN ('app_role', 'custom_role')),
  role_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_name, module_name)
);

-- Ativar RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Criar política para desenvolvedores (acesso total)
CREATE POLICY "Developers can manage all module permissions" ON public.module_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'gilberto@datascope.com.br'
    )
  );

-- Criar política para administradores (apenas leitura das próprias permissões)
CREATE POLICY "Admins can view their module permissions" ON public.module_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND module_permissions.role_name = ur.role::text
    )
  );

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_module_permissions_role_module 
  ON public.module_permissions(role_name, module_name);

-- Criar índice para consultas por role_type
CREATE INDEX IF NOT EXISTS idx_module_permissions_role_type 
  ON public.module_permissions(role_type, is_active);

-- Função para verificar permissões de módulo
CREATE OR REPLACE FUNCTION public.check_module_permission(
  p_role_name TEXT,
  p_module_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.module_permissions
    WHERE role_name = p_role_name
    AND module_name = p_module_name
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter permissões de um role
CREATE OR REPLACE FUNCTION public.get_role_permissions(p_role_name TEXT)
RETURNS TABLE(module_name TEXT, is_active BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT mp.module_name, mp.is_active
  FROM public.module_permissions mp
  WHERE mp.role_name = p_role_name
  ORDER BY mp.module_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir permissões padrão
INSERT INTO public.module_permissions (role_type, role_name, module_name, is_active) VALUES
  -- Desenvolvedor: acesso total
  ('app_role', 'developer', 'leads', true),
  ('app_role', 'developer', 'surveys', true),
  ('app_role', 'developer', 'raffles', true),
  ('app_role', 'developer', 'analytics', true),
  ('app_role', 'developer', 'feedback', true),
  
  -- Organizador: módulos específicos
  ('app_role', 'organizer', 'surveys', true),
  ('app_role', 'organizer', 'analytics', true),
  ('app_role', 'organizer', 'feedback', true),
  
  -- Administrador: módulos principais
  ('app_role', 'admin', 'leads', true),
  ('app_role', 'admin', 'surveys', true),
  ('app_role', 'admin', 'raffles', true),
  ('app_role', 'admin', 'analytics', true),
  
  -- Entrevistador: apenas leads
  ('app_role', 'interviewer', 'leads', true)
ON CONFLICT (role_name, module_name) DO NOTHING;