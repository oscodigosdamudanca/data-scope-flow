-- Script de Diagnóstico para Erro de RLS na Criação de Perfis
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- 1. Verificar se o usuário está autenticado
SELECT 
    'Usuário Autenticado:' as info,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ Usuário não autenticado'
        ELSE '✅ Usuário autenticado'
    END as status;

-- 2. Verificar se a tabela profiles existe e tem RLS habilitado
SELECT 
    'Tabela Profiles:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Verificar políticas RLS da tabela profiles
SELECT 
    'Políticas RLS Profiles:' as info,
    policyname,
    cmd as command,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 4. Verificar se o usuário tem role 'developer'
SELECT 
    'Roles do Usuário:' as info,
    ur.role,
    ur.created_at,
    CASE 
        WHEN ur.role = 'developer' THEN '✅ Usuário é developer'
        ELSE '⚠️ Usuário não é developer'
    END as developer_status
FROM public.user_roles ur
WHERE ur.user_id = auth.uid();

-- 5. Testar a função has_role
SELECT 
    'Teste has_role:' as info,
    public.has_role(auth.uid(), 'developer') as is_developer,
    public.has_role(auth.uid(), 'admin') as is_admin,
    public.has_role(auth.uid(), 'organizer') as is_organizer,
    public.has_role(auth.uid(), 'interviewer') as is_interviewer;

-- 6. Verificar se já existe um perfil para o usuário
SELECT 
    'Perfil Existente:' as info,
    p.id,
    p.display_name,
    p.phone,
    p.created_at,
    CASE 
        WHEN p.id IS NOT NULL THEN '⚠️ Perfil já existe'
        ELSE '✅ Nenhum perfil encontrado'
    END as profile_status
FROM public.profiles p
WHERE p.id = auth.uid();

-- 7. Simular a condição da política RLS de inserção
SELECT 
    'Simulação Política Insert:' as info,
    auth.uid() as current_user_id,
    auth.uid() as proposed_profile_id,
    (auth.uid() = auth.uid()) as policy_check_result,
    CASE 
        WHEN auth.uid() = auth.uid() THEN '✅ Política permitiria inserção'
        ELSE '❌ Política bloquearia inserção'
    END as policy_status;

-- 8. Verificar estrutura da tabela profiles
SELECT 
    'Estrutura Profiles:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 9. Verificar se há triggers na tabela profiles
SELECT 
    'Triggers Profiles:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' AND event_object_table = 'profiles';

-- 10. Verificar permissões do usuário atual
SELECT 
    'Permissões do Usuário:' as info,
    has_table_privilege(auth.uid()::text, 'public.profiles', 'INSERT') as can_insert,
    has_table_privilege(auth.uid()::text, 'public.profiles', 'SELECT') as can_select,
    has_table_privilege(auth.uid()::text, 'public.profiles', 'UPDATE') as can_update,
    has_table_privilege(auth.uid()::text, 'public.profiles', 'DELETE') as can_delete;