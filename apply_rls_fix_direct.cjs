const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://bhjreswsrfvnzyvmxtwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoanJlc3dzcmZ2bnp5dm14dHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ1NTk1NCwiZXhwIjoyMDczMDMxOTU0fQ.Ej8JVtBOQJhYGJhYGJhYGJhYGJhYGJhYGJhYGJhYGJhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Iniciando correção RLS...');
  
  try {
    // PASSO 1: Desabilitar RLS temporariamente
    console.log('📋 PASSO 1: Desabilitando RLS temporariamente...');
    
    const disableRLS = [
      'ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;'
    ];
    
    for (const sql of disableRLS) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`⚠️  Erro ao executar: ${sql}`);
        console.log(`   Erro: ${error.message}`);
      } else {
        console.log(`✅ Executado: ${sql}`);
      }
    }
    
    // PASSO 2: Remover políticas existentes
    console.log('📋 PASSO 2: Removendo políticas existentes...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;',
      'DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;',
      'DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;',
      'DROP POLICY IF EXISTS "Company admins can update company" ON public.companies;',
      'DROP POLICY IF EXISTS "Users can view their memberships" ON public.company_memberships;',
      'DROP POLICY IF EXISTS "Company admins can manage memberships" ON public.company_memberships;'
    ];
    
    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`⚠️  Erro ao executar: ${sql}`);
        console.log(`   Erro: ${error.message}`);
      } else {
        console.log(`✅ Executado: ${sql}`);
      }
    }
    
    // PASSO 3: Criar novas políticas seguras
    console.log('📋 PASSO 3: Criando novas políticas seguras...');
    
    const createPolicies = [
      // Políticas para profiles
      `CREATE POLICY "profiles_select_policy" ON public.profiles 
       FOR SELECT USING (auth.uid() = id);`,
      
      `CREATE POLICY "profiles_insert_policy" ON public.profiles 
       FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      `CREATE POLICY "profiles_update_policy" ON public.profiles 
       FOR UPDATE USING (auth.uid() = id);`,
      
      // Políticas para companies
      `CREATE POLICY "companies_select_policy" ON public.companies 
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM public.company_memberships cm 
           WHERE cm.company_id = id AND cm.user_id = auth.uid()
         )
       );`,
      
      `CREATE POLICY "companies_update_policy" ON public.companies 
       FOR UPDATE USING (
         EXISTS (
           SELECT 1 FROM public.company_memberships cm 
           WHERE cm.company_id = id AND cm.user_id = auth.uid() AND cm.role = 'admin'
         )
       );`,
      
      // Políticas para company_memberships
      `CREATE POLICY "memberships_select_policy" ON public.company_memberships 
       FOR SELECT USING (user_id = auth.uid());`,
      
      `CREATE POLICY "memberships_insert_policy" ON public.company_memberships 
       FOR INSERT WITH CHECK (
         auth.uid() = user_id OR 
         EXISTS (
           SELECT 1 FROM public.company_memberships cm 
           WHERE cm.company_id = company_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
         )
       );`
    ];
    
    for (const sql of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`⚠️  Erro ao executar política`);
        console.log(`   Erro: ${error.message}`);
      } else {
        console.log(`✅ Política criada com sucesso`);
      }
    }
    
    // PASSO 4: Reabilitar RLS
    console.log('📋 PASSO 4: Reabilitando RLS...');
    
    const enableRLS = [
      'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;'
    ];
    
    for (const sql of enableRLS) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`⚠️  Erro ao executar: ${sql}`);
        console.log(`   Erro: ${error.message}`);
      } else {
        console.log(`✅ Executado: ${sql}`);
      }
    }
    
    // PASSO 5: Verificar políticas
    console.log('📋 PASSO 5: Verificando políticas criadas...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', ['profiles', 'companies', 'company_memberships']);
    
    if (policiesError) {
      console.log('⚠️  Erro ao verificar políticas:', policiesError.message);
    } else {
      console.log(`✅ Total de políticas encontradas: ${policies.length}`);
      policies.forEach(policy => {
        console.log(`   - ${policy.tablename}: ${policy.policyname}`);
      });
    }
    
    console.log('🎉 Correção RLS aplicada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção RLS:', error.message);
    process.exit(1);
  }
}

// Executar a correção
applyRLSFix();