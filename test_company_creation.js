import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testCompanyCreation() {
  console.log('🔍 Testando criação de empresa...');
  console.log('URL:', process.env.VITE_SUPABASE_URL);
  console.log('Key presente:', !!process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  try {
    // Primeiro, vamos verificar se conseguimos fazer uma consulta simples
    console.log('\n📋 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão OK');
    
    // Agora vamos tentar criar uma empresa
    const companyData = {
      name: 'Teste Empresa ' + Date.now(),
      legal_name: 'Teste Empresa LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'teste@empresa.com',
      phone: '(11) 99999-9999',
      address: { street: 'Rua Teste, 123' }
      // Removendo created_by para ver se é obrigatório
    };

    console.log('\n📝 Dados da empresa:', JSON.stringify(companyData, null, 2));

    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select();

    if (error) {
      console.error('\n❌ Erro ao criar empresa:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      
      // Vamos tentar entender melhor o erro
      if (error.code === '42501') {
        console.log('\n🔒 Erro de permissão - verificando políticas RLS...');
      } else if (error.code === '23502') {
        console.log('\n📋 Erro de campo obrigatório - verificando campos NOT NULL...');
      }
    } else {
      console.log('\n✅ Empresa criada com sucesso:', data);
    }
  } catch (err) {
    console.error('\n❌ Erro inesperado:', err);
  }
}

testCompanyCreation();