import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompaniesRLS() {
  console.log('🔍 Verificando políticas RLS da tabela companies...\n');

  try {
    // 1. Verificar se a tabela companies existe
    console.log('1️⃣ Verificando se a tabela companies existe...');
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (companiesError) {
      console.error('❌ Erro ao acessar tabela companies:', companiesError.message);
      return;
    }
    console.log('✅ Tabela companies acessível');

    // 2. Testar autenticação
    console.log('\n2️⃣ Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'test123456'
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }
    console.log('✅ Usuário criado:', authData.user?.id);

    // 3. Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: authData.user?.email,
      password: 'test123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    console.log('✅ Login realizado');

    // 4. Tentar criar uma empresa
    console.log('\n3️⃣ Tentando criar empresa...');
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Empresa Teste RLS',
        cnpj: '12345678000199',
        email: 'teste@empresa.com',
        phone: '11999999999'
      })
      .select();

    if (companyError) {
      console.error('❌ ERRO AO CRIAR EMPRESA:', companyError.message);
      console.error('Detalhes do erro:', companyError);
      
      // Verificar se é erro de RLS
      if (companyError.message.includes('RLS') || companyError.message.includes('policy')) {
        console.log('\n🔒 PROBLEMA IDENTIFICADO: Política RLS bloqueando INSERT');
        console.log('💡 SOLUÇÃO: Criar política RLS que permita INSERT para usuários autenticados');
      }
    } else {
      console.log('✅ EMPRESA CRIADA COM SUCESSO:', companyData);
    }

    // 5. Verificar políticas RLS existentes
    console.log('\n4️⃣ Verificando políticas RLS existentes...');
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'companies' });

    if (policiesError) {
      console.log('ℹ️ Não foi possível verificar políticas RLS via RPC');
    } else {
      console.log('📋 Políticas encontradas:', policiesData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkCompaniesRLS();
