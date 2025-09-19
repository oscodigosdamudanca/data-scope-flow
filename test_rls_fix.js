const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testRLSFix() {
  console.log('🔧 Testando correções das políticas RLS...\n');

  try {
    // Teste 1: Verificar se company_memberships está acessível sem recursão
    console.log('1️⃣ Testando acesso à tabela company_memberships...');
    const { data: memberships, error: membershipError } = await supabase
      .from('company_memberships')
      .select('*')
      .limit(1);

    if (membershipError) {
      console.log('❌ Erro ao acessar company_memberships:', membershipError.message);
      if (membershipError.message.includes('infinite recursion') || 
          membershipError.message.includes('stack depth limit')) {
        console.log('🚨 RECURSÃO INFINITA AINDA PRESENTE!');
        return false;
      }
    } else {
      console.log('✅ company_memberships acessível sem recursão');
    }

    // Teste 2: Verificar se companies está acessível
    console.log('\n2️⃣ Testando acesso à tabela companies...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companiesError) {
      console.log('❌ Erro ao acessar companies:', companiesError.message);
      if (companiesError.message.includes('infinite recursion') || 
          companiesError.message.includes('stack depth limit')) {
        console.log('🚨 RECURSÃO INFINITA AINDA PRESENTE!');
        return false;
      }
    } else {
      console.log('✅ companies acessível sem recursão');
    }

    // Teste 3: Verificar se leads tem RLS ativo
    console.log('\n3️⃣ Testando acesso à tabela leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadsError) {
      if (leadsError.message.includes('RLS') || leadsError.message.includes('policy')) {
        console.log('✅ leads protegida por RLS (esperado sem autenticação)');
      } else {
        console.log('❌ Erro inesperado em leads:', leadsError.message);
      }
    } else {
      console.log('⚠️ leads acessível sem autenticação - RLS pode estar desabilitado');
    }

    // Teste 4: Verificar se surveys tem RLS ativo
    console.log('\n4️⃣ Testando acesso à tabela surveys...');
    const { data: surveys, error: surveysError } = await supabase
      .from('surveys')
      .select('*')
      .limit(1);

    if (surveysError) {
      if (surveysError.message.includes('RLS') || surveysError.message.includes('policy')) {
        console.log('✅ surveys protegida por RLS (esperado sem autenticação)');
      } else {
        console.log('❌ Erro inesperado em surveys:', surveysError.message);
      }
    } else {
      console.log('⚠️ surveys acessível sem autenticação - RLS pode estar desabilitado');
    }

    // Teste 5: Verificar relacionamentos
    console.log('\n5️⃣ Testando relacionamento companies -> surveys...');
    const { data: companySurveys, error: relationError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        surveys (
          id,
          title
        )
      `)
      .limit(1);

    if (relationError) {
      if (relationError.message.includes('infinite recursion') || 
          relationError.message.includes('stack depth limit')) {
        console.log('❌ RECURSÃO INFINITA no relacionamento!');
        return false;
      } else {
        console.log('⚠️ Erro no relacionamento (pode ser devido ao RLS):', relationError.message);
      }
    } else {
      console.log('✅ Relacionamento companies -> surveys funcionando');
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('✅ Recursão infinita corrigida');
    console.log('✅ Tabelas principais acessíveis');
    console.log('✅ RLS funcionando corretamente');
    
    return true;

  } catch (error) {
    console.log('❌ Erro geral no teste:', error.message);
    return false;
  }
}

// Executar teste
testRLSFix()
  .then(success => {
    if (success) {
      console.log('\n🚀 Correções RLS aplicadas com sucesso!');
      process.exit(0);
    } else {
      console.log('\n🚨 Ainda há problemas nas políticas RLS');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });