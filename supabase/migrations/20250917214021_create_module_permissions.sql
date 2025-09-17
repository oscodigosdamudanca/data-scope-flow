-- Criação da tabela de permissões de módulos
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL,
  role_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_type, role_name, module_name)
);

-- Adiciona políticas RLS para a tabela
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- Política para desenvolvedor (acesso total)
CREATE POLICY "Desenvolvedores podem gerenciar todas as permissões" 
ON module_permissions 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'app_role' = 'developer');

-- Índice para melhorar a performance das consultas
CREATE INDEX idx_module_permissions_role ON module_permissions(role_type, role_name);

-- Função para verificar permissões
CREATE OR REPLACE FUNCTION check_module_permission(
  p_role_name TEXT,
  p_module_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM module_permissions
    WHERE role_name = p_role_name
    AND module_name = p_module_name
    AND is_active = TRUE
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;