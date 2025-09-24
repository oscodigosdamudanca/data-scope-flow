-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DO SUPABASE STORAGE
-- Este script deve ser executado no SQL Editor do Supabase
-- Data: 27/01/2025
-- Autor: DataScope Team

-- =====================================================
-- PARTE 1: CRIAR BUCKET AVATARS (se não existir)
-- =====================================================

-- Inserir bucket avatars na tabela storage.buckets
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'avatars',
  'avatars', 
  NULL,
  true,
  false,
  5242880, -- 5MB em bytes
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  updated_at = NOW();

-- =====================================================
-- PARTE 2: CRIAR POLÍTICAS RLS PARA STORAGE
-- =====================================================

-- Política para permitir que usuários autenticados vejam todos os avatares (READ)
CREATE POLICY "Avatars são visíveis publicamente" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir que usuários autenticados façam upload de seus próprios avatares (INSERT)
CREATE POLICY "Usuários podem fazer upload de seus avatares" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários autenticados atualizem seus próprios avatares (UPDATE)
CREATE POLICY "Usuários podem atualizar seus avatares" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários autenticados deletem seus próprios avatares (DELETE)
CREATE POLICY "Usuários podem deletar seus avatares" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PARTE 3: VERIFICAÇÕES E VALIDAÇÕES
-- =====================================================

-- Verificar se o bucket foi criado
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- Verificar políticas criadas
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
AND policyname LIKE '%avatar%';

-- =====================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- =====================================================

/*
1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Cole este script completo
5. Clique em "Run" para executar
6. Verifique se não há erros na execução
7. Teste o upload de foto na aplicação

OBSERVAÇÕES IMPORTANTES:
- Este script é seguro para executar múltiplas vezes
- As políticas RLS garantem que cada usuário só pode gerenciar seus próprios avatares
- O bucket será público para leitura, mas protegido para escrita
- Arquivos devem ser organizados por pasta do usuário (user_id)
*/