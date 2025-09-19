import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Configurar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: !!supabaseKey
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verificando se a migração foi aplicada corretamente...\n');

  try {
    // 1. Verificar políticas RLS na tabela profiles
    console.log('1️⃣ Verificando políticas RLS na tabela profiles...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'profiles' 
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError);
      return;
    }

    console.log('📋 Políticas encontradas:');
    if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
        console.log(`     Roles: ${policy.roles}`);
        console.log(`     With Check: ${policy.with_check}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️ Nenhuma política encontrada na tabela profiles');
    }

    // 2. Verificar se a função has_role existe
    console.log('2️⃣ Verificando função has_role...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            proname,
            prosrc
          FROM pg_proc 
          WHERE proname = 'has_role';
        `
      });

    if (functionsError) {
      console.error('❌ Erro ao verificar função has_role:', functionsError);
      return;
    }

    if (functions && functions.length > 0) {
      console.log('✅ Função has_role encontrada');
    } else {
      console.log('❌ Função has_role NÃO encontrada');
    }

    // 3. Testar a política manualmente
    console.log('3️⃣ Testando política manualmente...');
    const { data: testResult, error: testError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            'Test policy check' as test,
            auth.uid() as current_user_id,
            (SELECT public.has_role(auth.uid(), 'developer')) as has_developer_role;
        `
      });

    if (testError) {
      console.error('❌ Erro ao testar política:', testError);
    } else {
      console.log('📊 Resultado do teste:', testResult);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verifyMigration();