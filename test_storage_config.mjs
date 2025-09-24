import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageConfig() {
  console.log('🔍 Testando configurações do Supabase Storage...\n');
  
  try {
    // 1. Listar buckets existentes
    console.log('1. Verificando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets?.map(b => b.name) || []);
    
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarBucket) {
      console.log('⚠️  Bucket "avatars" não encontrado. Tentando criar...');
      
      // 2. Tentar criar o bucket
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket "avatars" criado com sucesso');
    } else {
      console.log('✅ Bucket "avatars" já existe');
      console.log('   - Público:', avatarBucket.public);
      console.log('   - Criado em:', avatarBucket.created_at);
    }
    
    // 3. Testar permissões de upload
    console.log('\n2. Testando permissões de upload...');
    
    // Criar um arquivo de teste pequeno
    const testContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const testFile = Buffer.from(testContent.split(',')[1], 'base64');
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
      
      // Verificar se é erro de RLS
      if (uploadError.message.includes('RLS') || uploadError.message.includes('policy')) {
        console.log('\n🔧 Possível problema de RLS detectado. Verificando políticas...');
        
        // Tentar listar arquivos para verificar permissões
        const { data: files, error: listFilesError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 1 });
        
        if (listFilesError) {
          console.error('❌ Erro ao listar arquivos:', listFilesError);
        } else {
          console.log('✅ Permissão de listagem OK');
        }
      }
      
      return;
    }
    
    console.log('✅ Upload de teste realizado com sucesso');
    
    // 4. Testar URL pública
    console.log('\n3. Testando URL pública...');
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);
    
    console.log('✅ URL pública gerada:', publicUrl);
    
    // 5. Limpar arquivo de teste
    console.log('\n4. Limpando arquivo de teste...');
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️  Erro ao deletar arquivo de teste:', deleteError);
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
    console.log('\n🎉 Todas as configurações do Storage estão funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testStorageConfig();