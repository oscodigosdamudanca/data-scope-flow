import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
  process.exit(1);
}

// Criar cliente Supabase com service role key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSRecursion() {
  console.log('🔧 Iniciando correção das políticas RLS...');
  
  try {
    // Script SQL para corrigir a recursão infinita
    const fixSQL = `
      -- CORREÇÃO IMEDIATA PARA RECURSÃO INFINITA NAS POLÍTICAS RLS
      -- ==========================================================

      -- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
      ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

      -- PASSO 2: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
      DROP POLICY IF EXISTS "company_memberships_select_policy" ON public.company_memberships;
      DROP POLICY IF EXISTS "company_memberships_insert_policy" ON public.company_memberships;
      DROP POLICY IF EXISTS "company_memberships_update_policy" ON public.company_memberships;
      DROP POLICY IF EXISTS "company_memberships_delete_policy" ON public.company_memberships;
      DROP POLICY IF EXISTS "Users can view their own company memberships" ON public.company_memberships;
      DROP POLICY IF EXISTS "Company admins can manage memberships" ON public.company_memberships;

      -- PASSO 3: CRIAR POLÍTICAS SEGURAS SEM RECURSÃO
      CREATE POLICY "company_memberships_select_safe" ON public.company_memberships
          FOR SELECT TO authenticated
          USING (user_id = auth.uid());

      CREATE POLICY "company_memberships_insert_safe" ON public.company_memberships
          FOR INSERT TO authenticated
          WITH CHECK (user_id = auth.uid());

      CREATE POLICY "company_memberships_update_safe" ON public.company_memberships
          FOR UPDATE TO authenticated
          USING (user_id = auth.uid())
          WITH CHECK (user_id = auth.uid());

      CREATE POLICY "company_memberships_delete_safe" ON public.company_memberships
          FOR DELETE TO authenticated
          USING (user_id = auth.uid());

      -- PASSO 4: REABILITAR RLS
      ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
    `;

    // Executar o script de correção
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL });
    
    if (error) {
      console.error('❌ Erro ao executar correção RLS:', error);
      return false;
    }

    console.log('✅ Políticas RLS corrigidas com sucesso!');
    
    // Verificar se as políticas foram criadas corretamente
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'company_memberships');
    
    if (policiesError) {
      console.warn('⚠️ Não foi possível verificar as políticas criadas:', policiesError);
    } else {
      console.log('📋 Políticas ativas para company_memberships:', policies?.length || 0);
    }

    return true;
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    return false;
  }
}

// Executar a correção
fixRLSRecursion()
  .then((success) => {
    if (success) {
      console.log('🎉 Correção concluída com sucesso!');
      console.log('🔄 Reinicie a aplicação para aplicar as mudanças.');
    } else {
      console.log('❌ Falha na correção. Verifique os logs acima.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });