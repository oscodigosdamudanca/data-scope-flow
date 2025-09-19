-- ========================================
-- VERIFICAÇÃO DE USUÁRIOS CADASTRADOS
-- Sistema DataScope - Análise Completa
-- ========================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS DE USUÁRIOS
-- ===============================================

SELECT 
    'ESTRUTURA DA TABELA PROFILES' as categoria,
    'Tabela principal de usuários' as item;

-- Verificar se a tabela profiles existe e sua estrutura
SELECT 
    'COLUNAS DA TABELA PROFILES' as categoria,
    column_name as item,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. LISTAR TODOS OS USUÁRIOS CADASTRADOS
-- =======================================

SELECT 
    'USUÁRIOS CADASTRADOS' as categoria,
    'Total de usuários na tabela profiles' as item;

-- Contar total de usuários
SELECT 
    'TOTAL DE USUÁRIOS' as categoria,
    COUNT(*) as total_usuarios
FROM public.profiles;

-- Listar todos os usuários com detalhes
SELECT 
    'LISTA COMPLETA DE USUÁRIOS' as categoria,
    p.id,
    p.display_name,
    p.phone,
    p.created_at,
    p.updated_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 3. VERIFICAR USUÁRIO ESPECÍFICO
-- ===============================

SELECT 
    'VERIFICAÇÃO DO EMAIL ESPECÍFICO' as categoria,
    'santananegociosdigitais@gmail.com' as email_procurado;

-- Buscar usuário específico por email na tabela auth.users (Supabase Auth)
-- Nota: Esta consulta pode não funcionar devido a permissões RLS
SELECT 
    'BUSCA NA TABELA AUTH.USERS' as categoria,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM auth.users au
WHERE au.email = 'santananegociosdigitais@gmail.com';

-- Verificar se existe profile correspondente
SELECT 
    'PROFILE CORRESPONDENTE' as categoria,
    p.id,
    p.display_name,
    p.phone,
    p.created_at
FROM public.profiles p
WHERE p.id IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = 'santananegociosdigitais@gmail.com'
);

-- 4. VERIFICAR ROLES E PERMISSÕES
-- ===============================

SELECT 
    'ROLES DOS USUÁRIOS' as categoria,
    'Verificação de funções atribuídas' as item;

-- Verificar roles na tabela user_roles
SELECT 
    'USER ROLES' as categoria,
    ur.user_id,
    ur.role,
    ur.created_at,
    p.display_name
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
ORDER BY ur.created_at DESC;

-- 5. VERIFICAR MEMBERSHIPS DE EMPRESAS
-- ====================================

SELECT 
    'COMPANY MEMBERSHIPS' as categoria,
    'Vínculos usuário-empresa' as item;

-- Verificar memberships
SELECT 
    'MEMBERSHIPS ATIVOS' as categoria,
    cm.user_id,
    cm.company_id,
    cm.role as company_role,
    cm.created_at,
    p.display_name,
    c.name as company_name
FROM public.company_memberships cm
LEFT JOIN public.profiles p ON p.id = cm.user_id
LEFT JOIN public.companies c ON c.id = cm.company_id
ORDER BY cm.created_at DESC;

-- 6. RESUMO FINAL
-- ===============

SELECT 
    'RESUMO FINAL' as categoria,
    'Análise completa do sistema de usuários' as item;

-- Estatísticas gerais
SELECT 
    'ESTATÍSTICAS GERAIS' as categoria,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.user_roles) as total_roles,
    (SELECT COUNT(*) FROM public.company_memberships) as total_memberships,
    (SELECT COUNT(*) FROM public.companies) as total_companies;

-- Verificar se o email específico existe em alguma tabela
SELECT 
    'RESULTADO DA BUSCA' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'santananegociosdigitais@gmail.com'
        ) THEN 'EMAIL ENCONTRADO na tabela auth.users'
        ELSE 'EMAIL NÃO ENCONTRADO na tabela auth.users'
    END as resultado_auth,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN auth.users au ON au.id = p.id
            WHERE au.email = 'santananegociosdigitais@gmail.com'
        ) THEN 'PROFILE ENCONTRADO para este email'
        ELSE 'PROFILE NÃO ENCONTRADO para este email'
    END as resultado_profile;

-- ========================================
-- INFORMAÇÕES SOBRE AS TABELAS
-- ========================================

SELECT 
    'INFORMAÇÕES DAS TABELAS' as categoria,
    'Estrutura do sistema de usuários DataScope' as item;

-- Tabelas relacionadas a usuários
SELECT 
    'TABELAS DE USUÁRIOS' as categoria,
    table_name,
    CASE 
        WHEN table_name = 'profiles' THEN 'Tabela principal de perfis de usuários'
        WHEN table_name = 'user_roles' THEN 'Funções/roles dos usuários (developer, admin, etc.)'
        WHEN table_name = 'company_memberships' THEN 'Vínculos entre usuários e empresas'
        WHEN table_name = 'companies' THEN 'Empresas expositoras'
        ELSE 'Outras tabelas relacionadas'
    END as descricao
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'company_memberships', 'companies')
ORDER BY table_name;

-- ========================================
-- OBSERVAÇÕES IMPORTANTES
-- ========================================

/*
ESTRUTURA DO SISTEMA DE USUÁRIOS DATASCOPE:

1. AUTH.USERS (Supabase Auth)
   - Tabela do sistema de autenticação do Supabase
   - Armazena email, senha (hash), confirmação de email
   - Gerenciada automaticamente pelo Supabase Auth

2. PUBLIC.PROFILES
   - Tabela principal de perfis de usuários
   - Conectada ao auth.users pelo ID (UUID)
   - Armazena: display_name, phone, created_at, updated_at

3. PUBLIC.USER_ROLES
   - Define as funções dos usuários no sistema
   - Roles: developer, fair_organizer, admin, interviewer
   - Relaciona user_id (profiles) com role (app_role enum)

4. PUBLIC.COMPANY_MEMBERSHIPS
   - Vínculos entre usuários e empresas
   - Define o papel do usuário na empresa (admin, member)
   - Permite que um usuário pertença a múltiplas empresas

5. PUBLIC.COMPANIES
   - Empresas expositoras cadastradas no sistema
   - Cada empresa pode ter múltiplos usuários vinculados

FLUXO DE CADASTRO:
1. Usuário se registra → Criado registro em auth.users
2. Trigger automático → Cria profile em public.profiles
3. Administrador → Atribui role em user_roles
4. Administrador → Vincula à empresa em company_memberships
*/