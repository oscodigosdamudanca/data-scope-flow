-- =====================================================
-- CORREÇÃO COMPLETA DA ESTRUTURA DA TABELA PROFILES
-- Data: 2025-09-23T21:18:00.000Z
-- =====================================================

-- VERIFICAR ESTRUTURA ATUAL DA TABELA PROFILES
SELECT 'Estrutura atual da tabela profiles:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ADICIONAR COLUNA EMAIL SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Coluna email adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna email já existe na tabela profiles';
    END IF;
END $$;

-- ADICIONAR COLUNA APP_ROLE SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'app_role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN app_role VARCHAR(50) DEFAULT 'interviewer';
        RAISE NOTICE 'Coluna app_role adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna app_role já existe na tabela profiles';
    END IF;
END $$;

-- ADICIONAR COLUNA COMPANY_ID SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'company_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
        RAISE NOTICE 'Coluna company_id adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna company_id já existe na tabela profiles';
    END IF;
END $$;

-- CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_app_role ON profiles(app_role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN profiles.email IS 'Email do usuário para contato e identificação';
COMMENT ON COLUMN profiles.app_role IS 'Papel do usuário no sistema (developer, organizer, admin, interviewer)';
COMMENT ON COLUMN profiles.company_id IS 'ID da empresa à qual o usuário pertence';

-- HABILITAR RLS NA TABELA PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS EXISTENTES PARA RECRIAR
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Developers can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage company profiles" ON profiles;

-- CRIAR POLÍTICAS RLS PARA PROFILES
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

CREATE POLICY "Admins can manage company profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p1 
      WHERE p1.id = auth.uid() 
      AND p1.app_role = 'admin'
      AND p1.company_id = profiles.company_id
    )
  );

-- AGORA RECRIAR A TABELA MODULE_PERMISSIONS COM A ESTRUTURA CORRETA
DROP TABLE IF EXISTS module_permissions CASCADE;

CREATE TABLE module_permissions (
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
COMMENT ON COLUMN module_permissions.description IS 'Descrição detalhada da permissão';

-- HABILITAR RLS
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS RLS PARA MODULE_PERMISSIONS
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

-- POPULAR DADOS DE PERMISSÕES PADRÃO
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

-- RECRIAR A VIEW USER_MODULE_PERMISSIONS
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

-- VERIFICAÇÕES FINAIS
SELECT 'Nova estrutura da tabela profiles:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela module_permissions:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'module_permissions' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Total de permissões inseridas:' as info;
SELECT COUNT(*) as total_permissions FROM module_permissions;

SELECT 'View user_module_permissions criada:' as info;
SELECT viewname FROM pg_views 
WHERE viewname = 'user_module_permissions' AND schemaname = 'public';

SELECT 'RLS habilitado nas tabelas:' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'module_permissions') AND schemaname = 'public';