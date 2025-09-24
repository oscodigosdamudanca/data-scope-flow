import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente necessárias não encontradas');
  console.log('Verificar:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: !!supabaseKey,
    SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey
  });
  process.exit(1);
}

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Cliente normal para testes
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAvatarsBucket() {
  console.log('🔍 Verificando bucket avatars...\n');
  
  try {
    // 1. Listar todos os buckets
    console.log('1. Listando buckets existentes:');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    console.log('Buckets encontrados:', buckets?.map(b => b.name) || []);
    
    // 2. Verificar se o bucket avatars existe
    const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarBucket) {
      console.log('\n❌ Bucket "avatars" não encontrado!');
      console.log('🔧 Criando bucket "avatars"...');
      
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }
      
      console.log('✅ Bucket "avatars" criado com sucesso!');
    } else {
      console.log('✅ Bucket "avatars" já existe');
      console.log('Configurações:', {
        id: avatarBucket.id,
        name: avatarBucket.name,
        public: avatarBucket.public,
        created_at: avatarBucket.created_at
      });
    }
    
    // 3. Verificar políticas do bucket
    console.log('\n3. Verificando políticas do Storage:');
    
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'avatars');
    
    if (policiesError) {
      console.log('⚠️  Não foi possível verificar políticas:', policiesError.message);
    } else {
      console.log('Políticas encontradas:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`- ${policy.name}: ${policy.definition}`);
      });
    }
    
    // 4. Testar upload básico
    console.log('\n4. Testando upload básico...');
    
    // Criar um arquivo de teste simples
    const testContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testFile = new Blob([testContent], { type: 'image/png' });
    
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
      
      // Tentar criar políticas básicas se não existirem
      console.log('\n�� Tentando criar políticas básicas...');
      
      const createPoliciesSQL = `
        -- Política para permitir upload de avatares
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
      `;
      
      const { error: policyError } = await supabaseAdmin.rpc('exec_sql', { 
        sql: createPoliciesSQL 
      });
      
      if (policyError) {
        console.error('❌ Erro ao criar políticas:', policyError);
      } else {
        console.log('✅ Políticas criadas com sucesso!');
      }
      
    } else {
      console.log('✅ Teste de upload bem-sucedido!');
      console.log('Dados do upload:', uploadData);
      
      // Limpar arquivo de teste
      await supabase.storage.from('avatars').remove([testFileName]);
      console.log('🧹 Arquivo de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAvatarsBucket();
