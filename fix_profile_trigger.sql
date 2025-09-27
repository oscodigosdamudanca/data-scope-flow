-- Corrigir trigger de criação automática de perfil
-- Este script deve ser executado no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se o trigger existe
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Remover função existente se houver
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Criar nova função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, app_role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'interviewer', -- Role padrão
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger para executar a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se o trigger foi criado corretamente
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Para o usuário já existente, vamos criar o perfil manualmente
-- Primeiro, vamos buscar o usuário existente
SELECT id, email, created_at FROM auth.users WHERE email = 'santananegociosdigitais@gmail.com';

-- 8. Inserir perfil para o usuário existente (substitua o ID pelo retornado acima)
-- IMPORTANTE: Execute este comando apenas após verificar o ID do usuário
/*
INSERT INTO public.profiles (id, display_name, phone, app_role, created_at, updated_at)
SELECT 
    id,
    'Gilberto Santana',
    NULL,
    'developer',
    created_at,
    NOW()
FROM auth.users 
WHERE email = 'santananegociosdigitais@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);
*/