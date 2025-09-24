-- =====================================================
-- SCRIPT PARA ADICIONAR COLUNA AVATAR_URL
-- =====================================================
-- Este script deve ser executado no painel do Supabase
-- SQL Editor para adicionar a coluna avatar_url à tabela profiles
-- 
-- Data: 27/01/2025
-- Autor: DataScope Team
-- =====================================================

-- Adicionar a coluna avatar_url à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da foto de perfil do usuário armazenada no Supabase Storage';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'avatar_url';

-- Mostrar estrutura completa da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Copie e cole este script completo
-- 4. Execute o script
-- 5. Verifique se a coluna foi adicionada na saída
-- =====================================================