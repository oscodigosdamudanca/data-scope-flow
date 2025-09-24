import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 CORREÇÃO IMEDIATA: Criando bucket avatars...\n');

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAvatarsBucket() {
  try {
    console.log('1. Verificando buckets existentes...');
    
    // Listar buckets existentes
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    console.log('Buckets existentes:', existingBuckets?.map(b => b.name) || []);
    
    // Verificar se o bucket avatars já existe
    const avatarsBucketExists = existingBuckets?.some(bucket => bucket.name === 'avatars');
    
    if (avatarsBucketExists) {
      console.log('✅ Bucket "avatars" já existe!');
    } else {
      console.log('2. Criando bucket "avatars"...');
      
      // Criar bucket avatars
      const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (bucketError) {
        console.error('❌ Erro ao criar bucket:', bucketError);
        return;
      }
      
      console.log('✅ Bucket "avatars" criado com sucesso!', bucketData);
    }
    
    console.log('\n3. Testando upload no bucket...');
    
    // Testar upload de um arquivo pequeno
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
    } else {
      console.log('✅ Teste de upload bem-sucedido!', uploadData);
      
      // Limpar arquivo de teste
      await supabaseAdmin.storage.from('avatars').remove([testFileName]);
      console.log('🧹 Arquivo de teste removido');
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA! O bucket avatars está funcionando.');
    console.log('📝 Agora teste o upload da foto no aplicativo.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createAvatarsBucket();