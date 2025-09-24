-- Adicionar coluna avatar_url à tabela profiles para suporte ao upload de imagens
-- Data: 27/01/2025
-- Autor: DataScope Team

-- Adicionar a coluna avatar_url à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da foto de perfil do usuário armazenada no Supabase Storage';

-- Verificar se a coluna foi adicionada com sucesso
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        RAISE NOTICE '✅ Coluna avatar_url adicionada com sucesso à tabela profiles';
    ELSE
        RAISE EXCEPTION '❌ Falha ao adicionar coluna avatar_url à tabela profiles';
    END IF;
END $$;