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

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS...');
  
  try {
    // Verificar se RLS está habilitado nas tabelas
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status');
    
    if (rlsError) {
      console.log('⚠️  Não foi possível verificar status RLS via RPC:', rlsError.message);
    } else {
      console.log('✅ Status RLS:', rlsStatus);
    }
    
    // Tentar acessar as tabelas sem autenticação
    console.log('\n📋 Testando acesso às tabelas...');
    
    const tables = ['leads', 'surveys', 'survey_questions', 'survey_responses'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('RLS')) {
            console.log(`✅ ${table}: RLS está funcionando (acesso negado sem autenticação)`);
          } else {
            console.log(`❌ ${table}: Erro inesperado:`, error.message);
          }
        } else {
          console.log(`⚠️  ${table}: Dados acessíveis sem autenticação (RLS pode estar desabilitado)`);
          console.log(`   Registros encontrados: ${data?.length || 0}`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro ao testar:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkRLSPolicies();