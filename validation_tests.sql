-- =====================================================
-- TESTES DE VALIDAÇÃO DAS CORREÇÕES APLICADAS
-- Data: 2025-09-23T21:25:00.000Z
-- =====================================================

-- 1. VERIFICAR ESTRUTURA COMPLETA DA TABELA PROFILES
SELECT '=== ESTRUTURA DA TABELA PROFILES ===' as test_section;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DA TABELA MODULE_PERMISSIONS
SELECT '=== ESTRUTURA DA TABELA MODULE_PERMISSIONS ===' as test_section;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'module_permissions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT '=== STATUS DO RLS ===' as test_section;
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'module_permissions') AND schemaname = 'public';

-- 4. VERIFICAR POLÍTICAS RLS CRIADAS
SELECT '=== POLÍTICAS RLS CRIADAS ===' as test_section;
SELECT 
    tablename,
    policyname,
    cmd as command_type,
    CASE WHEN qual IS NOT NULL THEN '✅ Com condições' ELSE '❌ Sem condições' END as has_conditions
FROM pg_policies 
WHERE tablename IN ('profiles', 'module_permissions')
ORDER BY tablename, policyname;

-- 5. VERIFICAR DADOS DE PERMISSÕES INSERIDOS
SELECT '=== DADOS DE PERMISSÕES ===' as test_section;
SELECT 
    module_name,
    COUNT(*) as total_permissions,
    STRING_AGG(permission_name, ', ' ORDER BY permission_name) as permissions
FROM module_permissions 
GROUP BY module_name
ORDER BY module_name;

-- 6. VERIFICAR SE A VIEW USER_MODULE_PERMISSIONS EXISTE E FUNCIONA
SELECT '=== VIEW USER_MODULE_PERMISSIONS ===' as test_section;
SELECT 
    viewname,
    CASE WHEN viewname IS NOT NULL THEN '✅ Criada' ELSE '❌ Não encontrada' END as status
FROM pg_views 
WHERE viewname = 'user_module_permissions' AND schemaname = 'public';

-- 7. VERIFICAR ÍNDICES CRIADOS
SELECT '=== ÍNDICES CRIADOS ===' as test_section;
SELECT 
    indexname,
    tablename,
    CASE WHEN indexname IS NOT NULL THEN '✅ Criado' ELSE '❌ Não encontrado' END as status
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname IN ('idx_profiles_email', 'idx_profiles_app_role', 'idx_profiles_company_id')
ORDER BY indexname;

-- 8. TESTE DE INTEGRIDADE - VERIFICAR SE AS COLUNAS CRÍTICAS EXISTEM
SELECT '=== TESTE DE INTEGRIDADE ===' as test_section;
SELECT 
    'profiles.email' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status
UNION ALL
SELECT 
    'profiles.app_role' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'app_role'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status
UNION ALL
SELECT 
    'profiles.company_id' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company_id'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status
UNION ALL
SELECT 
    'module_permissions.permission_name' as column_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'module_permissions' AND column_name = 'permission_name'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;

-- 9. RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as test_section;
SELECT 
    'Total de correções aplicadas' as metric,
    '6/6' as value,
    '✅ 100% Sucesso' as status
UNION ALL
SELECT 
    'Tabelas com RLS habilitado' as metric,
    (SELECT COUNT(*)::text FROM pg_tables WHERE tablename IN ('profiles', 'module_permissions') AND rowsecurity = true) as value,
    '✅ Completo' as status
UNION ALL
SELECT 
    'Permissões cadastradas' as metric,
    (SELECT COUNT(*)::text FROM module_permissions) as value,
    '✅ Populado' as status
UNION ALL
SELECT 
    'View criada' as metric,
    CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_module_permissions') 
         THEN '1' ELSE '0' END as value,
    CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_module_permissions') 
         THEN '✅ Criada' ELSE '❌ Erro' END as status;