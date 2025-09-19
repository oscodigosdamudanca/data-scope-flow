-- Script para testar o sistema de permissões e políticas RLS
-- Execute este script no SQL Editor do Supabase para validar as permissões

-- ========================================
-- 1. VERIFICAR DADOS DE PERMISSÕES PADRÃO
-- ========================================

-- Verificar se as permissões padrão foram inseridas
SELECT 
    'Permissões por Módulo' as categoria,
    module_name,
    COUNT(*) as total_roles,
    STRING_AGG(role_name, ', ' ORDER BY role_name) as roles_com_acesso
FROM module_permissions 
WHERE is_active = true
GROUP BY module_name
ORDER BY module_name;

-- Verificar se as permissões padrão foram inseridas por role
SELECT 
    'Permissões por Role' as categoria,
    role_name,
    COUNT(*) as total_modules,
    STRING_AGG(module_name, ', ' ORDER BY module_name) as modules_com_acesso
FROM module_permissions 
WHERE is_active = true
GROUP BY role_name
ORDER BY role_name;

-- ========================================
-- 2. TESTAR FUNÇÕES DE PERMISSÃO
-- ========================================

-- Testar função check_module_permission (deve existir)
SELECT 
    'Teste de Função' as categoria,
    routine_name,
    routine_type,
    'Função encontrada' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_module_permission';

-- ========================================
-- 3. VERIFICAR POLÍTICAS RLS ATIVAS
-- ========================================

-- Verificar se RLS está ativo nas tabelas principais
SELECT 
    'Status RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✓ RLS ATIVO'
        ELSE '✗ RLS INATIVO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)
ORDER BY tablename;

-- ========================================
-- 4. LISTAR POLÍTICAS RLS EXISTENTES
-- ========================================

-- Verificar políticas RLS por tabela
SELECT 
    'Políticas RLS' as categoria,
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ' ORDER BY policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)
GROUP BY tablename
ORDER BY tablename;

-- ========================================
-- 5. VERIFICAR CONSTRAINTS E INTEGRIDADE
-- ========================================

-- Verificar constraints de chave estrangeira
SELECT 
    'Constraints FK' as categoria,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- 6. VERIFICAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Verificar índices criados nas tabelas principais
SELECT 
    'Índices' as categoria,
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE '%_pkey' THEN 'Primary Key'
        WHEN indexname LIKE '%_unique%' THEN 'Unique Index'
        WHEN indexname LIKE '%_idx%' THEN 'Performance Index'
        ELSE 'Other Index'
    END as index_type
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)
ORDER BY tablename, index_type, indexname;

-- ========================================
-- 7. TESTE DE INTEGRIDADE DOS DADOS
-- ========================================

-- Verificar se há dados órfãos ou inconsistências
SELECT 
    'Integridade de Dados' as categoria,
    'company_memberships sem company' as teste,
    COUNT(*) as registros_problematicos
FROM company_memberships cm
LEFT JOIN companies c ON cm.company_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 
    'Integridade de Dados' as categoria,
    'company_memberships sem profile' as teste,
    COUNT(*) as registros_problematicos
FROM company_memberships cm
LEFT JOIN profiles p ON cm.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Integridade de Dados' as categoria,
    'user_roles sem profile' as teste,
    COUNT(*) as registros_problematicos
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
WHERE p.id IS NULL;

-- ========================================
-- 8. RESUMO FINAL DO STATUS
-- ========================================

SELECT 
    'RESUMO FINAL' as categoria,
    'Total de Tabelas Principais' as item,
    COUNT(*) as valor
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Tabelas com RLS Ativo' as item,
    COUNT(*) as valor
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Total de Políticas RLS' as item,
    COUNT(*) as valor
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'companies', 'company_memberships', 
    'user_roles', 'module_permissions', 'leads', 
    'surveys', 'raffles'
)

UNION ALL

SELECT 
    'RESUMO FINAL' as categoria,
    'Permissões de Módulo Ativas' as item,
    COUNT(*) as valor
FROM module_permissions 
WHERE is_active = true

ORDER BY categoria DESC, item;