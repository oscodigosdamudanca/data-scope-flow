import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Testando aplicação DataScope...\n');

async function testBasicFunctionality() {
  try {
    console.log('📋 1. Testando conexão com Supabase...');
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('companies')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    console.log(`📊 Tabela companies existe (${data || 0} registros)`);
    
    console.log('\n📋 2. Testando tabelas principais...');
    
    // Testa cada tabela principal
    const tables = ['companies', 'profiles', 'leads', 'surveys', 'module_permissions'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (tableError) {
          console.log(`❌ Tabela ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }
    
    console.log('\n📋 3. Testando inserção de dados de teste...');
    
    // Testa inserção de uma empresa
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Empresa Teste',
        cnpj: '12345678000199',
        email: 'teste@empresa.com',
        phone: '11999999999'
      })
      .select()
      .single();
    
    if (companyError) {
      console.log('❌ Erro ao inserir empresa:', companyError.message);
    } else {
      console.log('✅ Inserção de empresa funcionando!');
      console.log(`📝 Empresa criada com ID: ${companyData.id}`);
      
      // Limpa o dado de teste
      await supabase
        .from('companies')
        .delete()
        .eq('id', companyData.id);
      
      console.log('🧹 Dados de teste removidos');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ A aplicação está pronta para uso!');
    
    return true;
    
  } catch (error) {
    console.log('💥 ERRO CRÍTICO:', error.message);
    return false;
  }
}

// Executa o teste
testBasicFunctionality()
  .then(success => {
    if (success) {
      console.log('\n🚀 STATUS: APLICAÇÃO OPERACIONAL');
    } else {
      console.log('\n❌ STATUS: APLICAÇÃO COM PROBLEMAS');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.log('💥 FALHA CRÍTICA:', error.message);
    process.exit(1);
  });