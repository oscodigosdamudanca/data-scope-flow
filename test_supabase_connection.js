import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testando conexão com Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Testar conexão básica
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
    } else {
      console.log('✅ Conexão com Supabase funcionando!');
    }
    
    // Testar storage
    console.log('\n🗂️ Testando Storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Erro no Storage:', storageError);
    } else {
      console.log('✅ Storage acessível!');
      console.log('Buckets encontrados:', buckets?.map(b => b.name) || []);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
