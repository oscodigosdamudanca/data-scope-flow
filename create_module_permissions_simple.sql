-- Criar tabela module_permissions
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_type VARCHAR(50) NOT NULL DEFAULT 'app_role',
    role_name VARCHAR(100) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(role_name, module_name)
);

-- Ativar RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Allow read access for authenticated users" ON public.module_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção/atualização/exclusão apenas para desenvolvedores
CREATE POLICY "Allow full access for developers" ON public.module_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%developer%'
        )
    );

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_module_permissions_role_name ON public.module_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_module_permissions_module_name ON public.module_permissions(module_name);
CREATE INDEX IF NOT EXISTS idx_module_permissions_active ON public.module_permissions(is_active);

-- Inserir permissões padrão
INSERT INTO public.module_permissions (role_name, module_name, is_active) VALUES
-- Desenvolvedor - acesso total
('developer', 'dashboard', true),
('developer', 'leads', true),
('developer', 'surveys', true),
('developer', 'raffles', true),
('developer', 'fair_feedback', true),
('developer', 'custom_surveys', true),
('developer', 'analytics', true),
('developer', 'admin', true),
('developer', 'developer', true),

-- Organizador da Feira
('organizer', 'dashboard', true),
('organizer', 'leads', true),
('organizer', 'surveys', true),
('organizer', 'raffles', true),
('organizer', 'fair_feedback', true),
('organizer', 'custom_surveys', true),
('organizer', 'analytics', true),
('organizer', 'admin', false),
('organizer', 'developer', false),

-- Administrador (Expositor)
('admin', 'dashboard', true),
('admin', 'leads', true),
('admin', 'surveys', true),
('admin', 'raffles', true),
('admin', 'fair_feedback', false),
('admin', 'custom_surveys', false),
('admin', 'analytics', true),
('admin', 'admin', true),
('admin', 'developer', false),

-- Entrevistador
('interviewer', 'dashboard', true),
('interviewer', 'leads', true),
('interviewer', 'surveys', false),
('interviewer', 'raffles', false),
('interviewer', 'fair_feedback', false),
('interviewer', 'custom_surveys', false),
('interviewer', 'analytics', false),
('interviewer', 'admin', false),
('interviewer', 'developer', false)

ON CONFLICT (role_name, module_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());