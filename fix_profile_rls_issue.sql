-- Fix Profile RLS Issue
-- Este script corrige o problema de RLS na criação de perfis

-- 1. Primeiro, vamos verificar a política atual
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Profiles: insert self';

-- 2. Remover a política problemática
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;

-- 3. Criar uma nova política mais permissiva para inserção de perfis
-- Permite que usuários autenticados criem perfis com seu próprio UUID
-- OU que desenvolvedores criem perfis para qualquer usuário
CREATE POLICY "Profiles: insert self or developer" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Usuário pode criar perfil com seu próprio UUID
  id = (SELECT auth.uid())
  OR
  -- OU desenvolvedor pode criar qualquer perfil
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- 4. Verificar se a política foi criada corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Profiles: insert self or developer';

-- 5. Testar a criação de um perfil
-- Esta query deve funcionar para usuários autenticados
-- INSERT INTO public.profiles (id, display_name, phone) 
-- VALUES (auth.uid(), 'Teste', '+5511999999999');