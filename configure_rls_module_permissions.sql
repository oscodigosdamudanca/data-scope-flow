-- Configuração de RLS para a tabela module_permissions
-- Este arquivo deve ser executado no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela (se ainda não estiver habilitado)
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir que desenvolvedores vejam todas as permissões
CREATE POLICY "Developers can view all module permissions" ON module_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'developer'
        )
    );

-- 3. Política para permitir que desenvolvedores insiram/atualizem permissões
CREATE POLICY "Developers can insert/update module permissions" ON module_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'developer'
        )
    );

-- 4. Política para permitir que organizadores vejam permissões relacionadas aos seus módulos
CREATE POLICY "Organizers can view relevant module permissions" ON module_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'organizer'
        )
        AND module_name IN ('feedback', 'surveys', 'bi_organizer')
    );

-- 5. Política para permitir que administradores vejam permissões relacionadas aos seus módulos
CREATE POLICY "Admins can view relevant module permissions" ON module_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
        AND module_name IN ('leads', 'raffles', 'bi_admin', 'settings')
    );

-- 6. Política para permitir que entrevistadores vejam apenas permissões de leads
CREATE POLICY "Interviewers can view leads module permissions" ON module_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'interviewer'
        )
        AND module_name = 'leads'
    );

-- 7. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'module_permissions';

-- 8. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'module_permissions';