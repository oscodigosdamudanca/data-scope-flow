-- ========================================
-- BUSCA ESPECÍFICA DE USUÁRIO ADMINISTRADOR
-- Sistema DataScope - Verificação Detalhada
-- ========================================

-- 1. VERIFICAR TOTAL DE USUÁRIOS NO SISTEMA
-- ==========================================

SELECT 
    'CONTAGEM GERAL' as tipo_verificacao,
    'Usuários cadastrados no sistema' as descricao,
    COUNT(*) as total
FROM public.profiles;

-- 2. LISTAR TODOS OS USUÁRIOS CADASTRADOS
-- =======================================

SELECT 
    'LISTA COMPLETA' as tipo_verificacao,
    'Todos os usuários do sistema' as descricao,
    p.id,
    p.display_name,
    p.phone,
    p.created_at::date as data_cadastro,
    COALESCE(ur.role::text, 'SEM ROLE') as role_sistema,
    CASE 
        WHEN cm.company_id IS NOT NULL THEN 'VINCULADO A EMPRESA'
        ELSE 'SEM EMPRESA'
    END as status_empresa
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN public.company_memberships cm ON cm.user_id = p.id
ORDER BY p.created_at DESC;

-- 3. BUSCAR USUÁRIO ESPECÍFICO POR EMAIL
-- ======================================

-- Nota: Como não temos acesso direto ao email na tabela profiles,
-- vamos tentar uma abordagem alternativa usando uma função

-- Primeiro, vamos verificar se existe alguma função que nos permita buscar por email
SELECT 
    'VERIFICAÇÃO DE FUNÇÕES' as tipo_verificacao,
    'Funções disponíveis para busca' as descricao,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name ILIKE '%user%' OR routine_name ILIKE '%email%'
ORDER BY routine_name;

-- 4. VERIFICAR SE HÁ USUÁRIOS COM ROLE DE DEVELOPER OU ADMIN
-- ==========================================================

SELECT 
    'USUÁRIOS PRIVILEGIADOS' as tipo_verificacao,
    'Usuários com roles administrativos' as descricao,
    p.id,
    p.display_name,
    p.phone,
    ur.role::text as role_sistema,
    p.created_at::date as data_cadastro,
    CASE 
        WHEN ur.role = 'developer' THEN 'Desenvolvedor - Acesso Total'
        WHEN ur.role = 'admin' THEN 'Administrador - Gestão de Empresa'
        WHEN ur.role = 'organizer' THEN 'Organizador - Gestão de Processos'
        WHEN ur.role = 'interviewer' THEN 'Entrevistador - Coleta de Dados'
        ELSE 'Role Desconhecido'
    END as role_description
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role IN ('developer', 'admin')
ORDER BY 
    CASE ur.role 
        WHEN 'developer' THEN 1
        WHEN 'admin' THEN 2
        ELSE 3
    END,
    p.created_at DESC;

-- 5. VERIFICAR EMPRESAS CADASTRADAS
-- =================================

SELECT 
    'EMPRESAS CADASTRADAS' as tipo_verificacao,
    'Lista de empresas no sistema' as descricao,
    c.id,
    c.name as nome_empresa,
    c.created_at::date as data_cadastro,
    COUNT(cm.user_id) as total_usuarios_vinculados
FROM public.companies c
LEFT JOIN public.company_memberships cm ON cm.company_id = c.id
GROUP BY c.id, c.name, c.created_at
ORDER BY c.created_at DESC;

-- 6. VERIFICAR MEMBERSHIPS DETALHADOS
-- ===================================

SELECT 
    'MEMBERSHIPS DETALHADOS' as tipo_verificacao,
    'Vínculos usuário-empresa com detalhes' as descricao,
    p.display_name as usuario,
    c.name as empresa,
    cm.role as papel_na_empresa,
    cm.created_at::date as data_vinculo
FROM public.company_memberships cm
JOIN public.profiles p ON p.id = cm.user_id
JOIN public.companies c ON c.id = cm.company_id
ORDER BY cm.created_at DESC;

-- 7. BUSCA ALTERNATIVA POR PADRÕES NO DISPLAY_NAME
-- ================================================

SELECT 
    'BUSCA POR PADRÃO' as tipo_verificacao,
    'Usuários com nomes similares a "santana"' as descricao,
    p.id,
    p.display_name,
    p.phone,
    p.created_at::date as data_cadastro,
    COALESCE(ur.role::text, 'SEM ROLE') as role_sistema
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE LOWER(p.display_name) ILIKE '%santana%' 
   OR LOWER(p.display_name) ILIKE '%gilberto%'
   OR LOWER(p.display_name) ILIKE '%negocios%'
   OR LOWER(p.display_name) ILIKE '%digitais%'
ORDER BY p.created_at DESC;

-- 8. VERIFICAR POLÍTICAS RLS ATIVAS
-- =================================

SELECT 
    'POLÍTICAS RLS' as tipo_verificacao,
    'Políticas de segurança que podem afetar a consulta' as descricao,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_roles', 'company_memberships')
ORDER BY tablename, policyname;

-- 9. RESUMO FINAL E RECOMENDAÇÕES
-- ===============================

SELECT 
    'RESUMO FINAL' as tipo_verificacao,
    'Status geral do sistema de usuários' as descricao,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.user_roles) as total_roles_atribuidos,
    (SELECT COUNT(*) FROM public.companies) as total_empresas,
    (SELECT COUNT(*) FROM public.company_memberships) as total_memberships,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'developer') as total_developers,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') as total_admins;

-- ========================================
-- INSTRUÇÕES PARA CRIAR USUÁRIO ADMINISTRADOR
-- ========================================

/*
CASO NÃO ENCONTRE O USUÁRIO "santananegociosdigitais@gmail.com":

Para criar um usuário administrador no sistema DataScope:

1. REGISTRO VIA INTERFACE:
   - Acesse a aplicação DataScope
   - Faça o registro com o email: santananegociosdigitais@gmail.com
   - Complete o processo de verificação de email

2. ATRIBUIÇÃO DE ROLE (Execute no SQL Editor):
   
   -- Primeiro, encontre o ID do usuário recém-criado
   SELECT p.id, p.display_name 
   FROM public.profiles p 
   ORDER BY p.created_at DESC 
   LIMIT 5;
   
   -- Substitua 'USER_ID_AQUI' pelo ID encontrado acima
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('USER_ID_AQUI', 'developer');

3. CRIAR EMPRESA (se necessário):
   
   INSERT INTO public.companies (name, created_at)
   VALUES ('Santana Negócios Digitais', NOW());
   
   -- Vincular usuário à empresa
   INSERT INTO public.company_memberships (user_id, company_id, role)
   VALUES (
     'USER_ID_AQUI', 
     (SELECT id FROM public.companies WHERE name = 'Santana Negócios Digitais'),
     'admin'
   );

OBSERVAÇÃO IMPORTANTE:
- O email fica armazenado na tabela auth.users (gerenciada pelo Supabase)
- A tabela profiles contém apenas o ID (UUID) que referencia auth.users
- Por questões de segurança RLS, pode não ser possível consultar auth.users diretamente
- O display_name na tabela profiles pode ser diferente do email
*/