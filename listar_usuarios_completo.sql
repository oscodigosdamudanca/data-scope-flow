-- ========================================
-- LISTAGEM COMPLETA DE USUÁRIOS CADASTRADOS
-- Sistema DataScope - Consulta Executável
-- ========================================

-- 1. TOTAL DE USUÁRIOS CADASTRADOS
-- ================================
SELECT 
    'RESUMO GERAL' as secao,
    COUNT(*) as total_usuarios,
    'Usuários cadastrados na tabela profiles' as descricao
FROM public.profiles;

-- 2. LISTA COMPLETA DE USUÁRIOS
-- =============================
SELECT 
    'USUÁRIOS CADASTRADOS' as secao,
    p.id,
    p.display_name,
    p.phone,
    p.created_at,
    p.updated_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 3. USUÁRIOS COM SUAS FUNÇÕES (ROLES)
-- ====================================
SELECT 
    'USUÁRIOS E ROLES' as secao,
    p.id,
    p.display_name,
    p.phone,
    ur.role,
    ur.created_at as role_assigned_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;

-- 4. USUÁRIOS COM VÍNCULOS A EMPRESAS
-- ===================================
SELECT 
    'USUÁRIOS E EMPRESAS' as secao,
    p.id,
    p.display_name,
    p.phone,
    c.name as empresa,
    cm.role as papel_na_empresa,
    cm.created_at as vinculo_criado_em
FROM public.profiles p
LEFT JOIN public.company_memberships cm ON p.id = cm.user_id
LEFT JOIN public.companies c ON cm.company_id = c.id
ORDER BY p.created_at DESC;

-- 5. RELATÓRIO COMPLETO - USUÁRIOS COM TODAS AS INFORMAÇÕES
-- =========================================================
SELECT 
    'RELATÓRIO COMPLETO' as secao,
    p.id::text as user_id,
    p.display_name,
    p.phone,
    COALESCE(ur.role::text, 'Sem role') as funcao_sistema,
    COALESCE(c.name, 'Sem empresa') as empresa,
    COALESCE(cm.role::text, 'Sem vínculo') as papel_empresa,
    p.created_at as usuario_criado_em,
    ur.created_at as role_atribuido_em,
    cm.created_at as vinculo_empresa_em
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.company_memberships cm ON p.id = cm.user_id
LEFT JOIN public.companies c ON cm.company_id = c.id
ORDER BY p.created_at DESC;

-- 6. VERIFICAÇÃO DA TABELA AUTH.USERS (SE ACESSÍVEL)
-- ==================================================
-- Nota: Esta consulta pode falhar devido às políticas RLS
SELECT 
    'VERIFICAÇÃO AUTH.USERS' as secao,
    'Tentativa de acesso à tabela de autenticação' as descricao;

-- Tentar listar usuários da tabela auth.users
SELECT 
    'AUTH.USERS' as secao,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM auth.users au
ORDER BY au.created_at DESC;