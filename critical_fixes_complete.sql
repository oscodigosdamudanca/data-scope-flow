
-- =====================================================
-- SCRIPT DE CORREÇÃO DOS PROBLEMAS CRÍTICOS
-- Data: 2025-09-23T21:05:22.500Z
-- =====================================================

-- CORREÇÃO 1: Adicionar coluna email à tabela profiles
-- ===================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Comentário para documentação
COMMENT ON COLUMN profiles.email IS 'Email do usuário para autenticação e comunicação';

-- CORREÇÃO 2: Criar tabela module_permissions
-- ==========================================
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(100) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_name, permission_name)
);

-- Comentários para documentação
COMMENT ON TABLE module_permissions IS 'Tabela de permissões por módulo do sistema';
COMMENT ON COLUMN module_permissions.module_name IS 'Nome do módulo (leads, surveys, etc.)';
COMMENT ON COLUMN module_permissions.permission_name IS 'Nome da permissão (create, read, update, delete)';

-- CORREÇÃO 3: Criar view user_module_permissions
-- =============================================
CREATE OR REPLACE VIEW user_module_permissions AS
SELECT 
  p.id as profile_id,
  p.email,
  p.app_role,
  p.company_id,
  mp.module_name,
  mp.permission_name,
  mp.description,
  CASE 
    WHEN p.app_role = 'developer' THEN true
    WHEN p.app_role = 'organizer' AND mp.module_name IN ('feedback', 'surveys', 'analytics') THEN true
    WHEN p.app_role = 'admin' AND mp.module_name IN ('leads', 'raffles', 'analytics') THEN true
    WHEN p.app_role = 'interviewer' AND mp.module_name = 'leads' AND mp.permission_name IN ('create', 'read') THEN true
    ELSE false
  END as has_permission
FROM profiles p
CROSS JOIN module_permissions mp
WHERE p.id = auth.uid() OR p.app_role = 'developer';

-- Comentário para documentação
COMMENT ON VIEW user_module_permissions IS 'View que combina usuários com suas permissões por módulo baseado no role';

-- CORREÇÃO 4: Habilitar RLS nas tabelas críticas
-- ==============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- CORREÇÃO 5: Remover políticas conflitantes e criar novas
-- =======================================================

-- Remover políticas existentes que possam estar conflitando
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Company members can view company data" ON companies;
DROP POLICY IF EXISTS "Company members can view company leads" ON leads;
DROP POLICY IF EXISTS "Company members can manage company surveys" ON surveys;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Developers can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

-- POLÍTICAS PARA COMPANIES
CREATE POLICY "Company members can view their company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role IN ('developer', 'organizer')
    )
  );

CREATE POLICY "Admins can update their company" ON companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role IN ('admin', 'developer')
    )
  );

-- POLÍTICAS PARA LEADS
CREATE POLICY "Company members can view their leads" ON leads
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role IN ('developer', 'organizer')
    )
  );

CREATE POLICY "Company members can create leads" ON leads
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.app_role IN ('admin', 'interviewer')
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

-- POLÍTICAS PARA SURVEYS
CREATE POLICY "Company members can view their surveys" ON surveys
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role IN ('developer', 'organizer')
    )
  );

CREATE POLICY "Admins can manage their surveys" ON surveys
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role IN ('admin', 'developer')
    )
  );

-- POLÍTICAS PARA MODULE_PERMISSIONS
CREATE POLICY "Developers can manage all module permissions" ON module_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

CREATE POLICY "Users can view module permissions" ON module_permissions
  FOR SELECT USING (true);

-- CORREÇÃO 6: Popular dados de permissões padrão
-- ==============================================
INSERT INTO module_permissions (module_name, permission_name, description) VALUES
('leads', 'create', 'Criar novos leads'),
('leads', 'read', 'Visualizar leads'),
('leads', 'update', 'Editar leads existentes'),
('leads', 'delete', 'Excluir leads'),
('surveys', 'create', 'Criar pesquisas'),
('surveys', 'read', 'Visualizar pesquisas'),
('surveys', 'update', 'Editar pesquisas'),
('surveys', 'delete', 'Excluir pesquisas'),
('raffles', 'create', 'Criar sorteios'),
('raffles', 'read', 'Visualizar sorteios'),
('raffles', 'execute', 'Executar sorteios'),
('analytics', 'read', 'Visualizar relatórios'),
('analytics', 'export', 'Exportar dados'),
('feedback', 'create', 'Criar feedback'),
('feedback', 'read', 'Visualizar feedback'),
('admin', 'users', 'Gerenciar usuários'),
('admin', 'companies', 'Gerenciar empresas'),
('admin', 'system', 'Configurações do sistema')
ON CONFLICT (module_name, permission_name) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================

-- VERIFICAÇÕES PÓS-EXECUÇÃO
-- =========================

-- Verificar se a coluna email foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as tabelas têm RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'companies', 'leads', 'surveys', 'module_permissions')
AND schemaname = 'public';

-- Verificar se as permissões foram inseridas
SELECT module_name, permission_name, description 
FROM module_permissions 
ORDER BY module_name, permission_name;

-- Verificar se a view foi criada
SELECT viewname 
FROM pg_views 
WHERE viewname = 'user_module_permissions' AND schemaname = 'public';
