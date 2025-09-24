-- =====================================================
-- SCRIPT COMPLETO PARA CRIAÇÃO DO BUCKET AVATARS
-- Execute no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. CRIAR O BUCKET AVATARS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. CRIAR POLÍTICAS RLS PARA O BUCKET AVATARS

-- Política para permitir que usuários autenticados façam upload de seus próprios avatars
CREATE POLICY "Usuários podem fazer upload de seus avatars" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários autenticados atualizem seus próprios avatars
CREATE POLICY "Usuários podem atualizar seus avatars" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários autenticados deletem seus próprios avatars
CREATE POLICY "Usuários podem deletar seus avatars" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização pública dos avatars
CREATE POLICY "Avatars são publicamente visíveis" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'avatars');

-- 3. HABILITAR RLS NO BUCKET (se não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 5. TESTAR A CONFIGURAÇÃO
-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatars';

-- =====================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- =====================================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique os resultados das consultas de verificação
-- 6. Teste o upload de avatar na aplicação
-- =====================================================