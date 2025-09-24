-- Script para verificar o status do bucket avatars e suas políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o bucket 'avatars' existe
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'avatars';

-- 2. Verificar políticas RLS na tabela storage.objects
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
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 3. Verificar se RLS está habilitado na tabela storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- 4. Verificar se há objetos no bucket avatars (se existir)
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
LIMIT 10;