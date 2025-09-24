-- =====================================================
-- CORREÇÃO IMEDIATA: BUCKET AVATARS E POLÍTICAS RLS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Data: 27/01/2025
-- =====================================================

-- 1. Criar bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver conflito)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 4. Criar políticas RLS para o bucket avatars

-- Política para permitir upload de avatares (usuários podem fazer upload na sua pasta)
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização pública de avatares
CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir atualização de avatares próprios
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de avatares próprios
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Verificar se tudo foi criado corretamente
SELECT 
  'Bucket criado' as status,
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- 6. Verificar políticas criadas
SELECT 
  'Políticas criadas' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Acesse o painel do Supabase
-- 2. Vá para SQL Editor
-- 3. Copie e cole este script completo
-- 4. Execute o script
-- 5. Verifique se o bucket e políticas foram criados
-- 6. Teste o upload da foto no aplicativo
-- =====================================================