import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testWithAuth() {
  console.log('🔍 Testando criação de empresa com autenticação...');
  
  try {
    // Verificar se já existe uma sessão
    const { data: session } = await supabase.auth.getSession();
    console.log('Sessão atual:', session.session ? 'Logado' : 'Não logado');
    
    if (!session.session) {
      console.log('❌ Usuário não está logado. Isso explica o erro de RLS.');
      console.log('💡 O formulário precisa de um usuário autenticado para funcionar.');
      return;
    }
    
    console.log('✅ Usuário logado:', session.session.user.email);
    console.log('🆔 User ID:', session.session.user.id);
    
    // Agora tentar criar empresa
    const companyData = {
      name: 'Teste Empresa Autenticada ' + Date.now(),
      created_by: session.session.user.id
    };
    
    console.log('📝 Tentando criar empresa:', companyData);
    
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select();
      
    if (error) {
      console.error('❌ Erro ao criar empresa:', error);
    } else {
      console.log('✅ Empresa criada com sucesso:', data);
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testWithAuth();