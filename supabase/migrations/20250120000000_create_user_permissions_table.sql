-- Criação da tabela de permissões de usuários
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  permission_type VARCHAR(20) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module, permission_type)
);

-- Comentários na tabela
COMMENT ON TABLE public.user_permissions IS 'Armazena as permissões específicas de cada usuário por módulo';
COMMENT ON COLUMN public.user_permissions.user_id IS 'ID do usuário no auth.users';
COMMENT ON COLUMN public.user_permissions.module IS 'Identificador do módulo da aplicação';
COMMENT ON COLUMN public.user_permissions.permission_type IS 'Tipo de permissão (view, create, edit, delete)';
COMMENT ON COLUMN public.user_permissions.granted IS 'Se a permissão está concedida ou não';

-- Trigger para atualizar o updated_at automaticamente
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Políticas RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Política para desenvolvedores (acesso total)
CREATE POLICY "Desenvolvedores têm acesso total às permissões" ON public.user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'developer'
    )
  );

-- Política para organizadores (visualização de todas as permissões)
CREATE POLICY "Organizadores podem visualizar todas as permissões" ON public.user_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'organizer'
    )
  );

-- Política para administradores (gerenciar permissões de sua própria empresa)
CREATE POLICY "Administradores gerenciam permissões de sua empresa" ON public.user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_admin
      JOIN public.profiles p_user ON p_user.company_id = p_admin.company_id
      WHERE p_admin.id = auth.uid() 
        AND p_admin.role = 'admin'
        AND p_user.id = user_permissions.user_id
    )
  );

-- Função para verificar permissão de usuário
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_module VARCHAR,
  p_permission VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
  user_role VARCHAR;
BEGIN
  -- Obter o papel do usuário
  SELECT role INTO user_role FROM public.profiles WHERE id = p_user_id;
  
  -- Desenvolvedores têm todas as permissões
  IF user_role = 'developer' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permissão específica
  SELECT granted INTO has_permission
  FROM public.user_permissions
  WHERE user_id = p_user_id
    AND module = p_module
    AND permission_type = p_permission;
  
  -- Se não encontrou permissão específica, retorna falso
  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;