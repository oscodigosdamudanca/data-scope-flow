-- Script para criar bucket avatars e configurar políticas RLS
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

-- 2. Habilitar RLS na tabela storage.objects (se não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem visualizar avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus avatares" ON storage.objects;

-- 4. Criar políticas RLS para o bucket avatars

-- Política para visualizar avatares (SELECT) - todos podem ver
CREATE POLICY "Usuários podem visualizar avatares" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para upload de avatares (INSERT) - apenas usuários autenticados
CREATE POLICY "Usuários podem fazer upload de avatares" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para atualizar avatares (UPDATE) - apenas próprios arquivos
CREATE POLICY "Usuários podem atualizar seus avatares" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para deletar avatares (DELETE) - apenas próprios arquivos
CREATE POLICY "Usuários podem deletar seus avatares" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Verificar se tudo foi criado corretamente
SELECT 'Bucket criado:' as status, id, name, public FROM storage.buckets WHERE id = 'avatars'
UNION ALL
SELECT 'Políticas criadas:' as status, policyname as id, tablename as name, 'RLS' as public 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%avatar%';