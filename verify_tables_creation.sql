-- Script para verificar se todas as tabelas foram criadas corretamente
-- Execute este script no SQL Editor do Supabase para verificar a estrutura

-- 1. Verificar se todas as tabelas existem
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar estrutura da tabela company_memberships
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'company_memberships'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela module_permissions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'module_permissions'
ORDER BY ordinal_position;

-- 4. Verificar se as políticas RLS estão ativas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'module_permissions');

-- 5. Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'module_permissions')
ORDER BY tablename, policyname;

-- 6. Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'module_permissions')
ORDER BY tablename, indexname;

-- 7. Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_module_permission', 'get_role_permissions')
ORDER BY routine_name;

-- 8. Verificar se há dados nas tabelas de permissões
SELECT 
    role_name,
    module_name,
    is_active,
    COUNT(*) as total_permissions
FROM module_permissions 
GROUP BY role_name, module_name, is_active
ORDER BY role_name, module_name;

-- 9. Verificar constraints e chaves estrangeiras
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('company_memberships', 'module_permissions')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 10. Verificar se todas as tabelas principais existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN '✓ profiles'
        ELSE '✗ profiles MISSING'
    END as profiles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN '✓ companies'
        ELSE '✗ companies MISSING'
    END as companies_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_memberships') THEN '✓ company_memberships'
        ELSE '✗ company_memberships MISSING'
    END as company_memberships_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN '✓ user_roles'
        ELSE '✗ user_roles MISSING'
    END as user_roles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'module_permissions') THEN '✓ module_permissions'
        ELSE '✗ module_permissions MISSING'
    END as module_permissions_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN '✓ leads'
        ELSE '✗ leads MISSING'
    END as leads_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'surveys') THEN '✓ surveys'
        ELSE '✗ surveys MISSING'
    END as surveys_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'raffles') THEN '✓ raffles'
        ELSE '✗ raffles MISSING'
    END as raffles_status;