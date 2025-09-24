# 🚨 CORREÇÃO URGENTE: BUCKET AVATARS

## ❌ PROBLEMA IDENTIFICADO
O bucket 'avatars' não existe no Supabase Storage, causando erro no upload de fotos.

## ✅ SOLUÇÃO IMEDIATA (2 MINUTOS)

### PASSO 1: Acessar o Painel Supabase
1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `bhjreswsrfvnzyvmxtwj`

### PASSO 2: Criar Bucket Avatars
1. No menu lateral, clique em **"Storage"**
2. Clique no botão **"New bucket"**
3. Preencha:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **MARCAR COMO PÚBLICO**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/gif, image/webp`
4. Clique em **"Save"**

### PASSO 3: Configurar Políticas RLS
1. Ainda na tela Storage, clique no bucket **"avatars"** criado
2. Vá para a aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"Custom"**
5. Cole este código SQL:

```sql
-- Política para permitir upload de avatares
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para permitir visualização pública
CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir atualização
CREATE POLICY "Users can update avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para permitir exclusão
CREATE POLICY "Users can delete avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL
);
```

### PASSO 4: Verificar Configuração
1. Volte para **Storage > avatars**
2. Teste fazendo upload de uma imagem qualquer
3. Se funcionar, delete a imagem de teste

## 🔧 ALTERNATIVA: SQL EDITOR
Se preferir usar SQL, vá para **SQL Editor** e execute:

```sql
-- Criar bucket avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
```

## ✅ APÓS A CORREÇÃO
1. Teste o upload da foto no aplicativo
2. O erro deve desaparecer imediatamente
3. As fotos serão salvas em: `https://bhjreswsrfvnzyvmxtwj.supabase.co/storage/v1/object/public/avatars/`

## 📞 SUPORTE
Se ainda houver problemas, verifique:
- Se o bucket foi criado como **público**
- Se as políticas RLS foram aplicadas
- Se não há erros no console do navegador

**TEMPO ESTIMADO: 2-3 MINUTOS**
**RESULTADO: UPLOAD DE FOTOS FUNCIONANDO** ✅