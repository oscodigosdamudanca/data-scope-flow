-- Script simplificado para criar bucket avatars
-- Execute este script no SQL Editor do Supabase

-- 1. Criar o bucket avatars (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar se o bucket foi criado
SELECT 'Bucket criado com sucesso:' as status, id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'avatars';