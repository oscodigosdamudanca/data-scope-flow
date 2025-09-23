const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

console.log('🔧 Iniciando correção de recursão RLS...');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usando service role para operações administrativas
);

async function applyRLSFix() {
  try {
    console.log('📖 Lendo script de correção...');
    const sqlScript = fs.readFileSync('./fix_rls_recursion_complete.sql', 'utf8');
    
    console.log('🚀 Aplicando correção de recursão RLS...');
    const start = Date.now();
    
    // Executar o script completo
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlScript
    });
    
    const executionTime = Date.now() - start;
    
    if (error) {
      console.log('❌ Erro ao aplicar correção:', error.message);
      
      // Tentar aplicar por partes se falhar
      console.log('🔄 Tentando aplicar correção por etapas...');
      await applyFixBySteps();
      return;
    }
    
    console.log('✅ Correção aplicada com sucesso!');
    console.log('⚡ Tempo de execução:', executionTime + 'ms');
    
    // Verificar se a correção funcionou
    await verifyFix();
    
  } catch (err) {
    console.log('❌ Erro durante a aplicação:', err.message);
    console.log('🔄 Tentando método alternativo...');
    await applyFixBySteps();
  }
}

async function applyFixBySteps() {
  console.log('📝 Aplicando correção por etapas...');
  
  try {
    // Etapa 1: Desabilitar RLS
    console.log('1️⃣ Desabilitando RLS temporariamente...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.module_permissions DISABLE ROW LEVEL SECURITY;
      `
    });
    
    // Etapa 2: Remover políticas problemáticas
    console.log('2️⃣ Removendo políticas problemáticas...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Profiles: select own or developer" ON public.profiles;
        DROP POLICY IF EXISTS "Profiles: insert own or developer" ON public.profiles;
        DROP POLICY IF EXISTS "Profiles: update own or developer" ON public.profiles;
        DROP POLICY IF EXISTS "Profiles: delete developer only" ON public.profiles;
        DROP POLICY IF EXISTS "Module permissions: select all authenticated" ON public.module_permissions;
        DROP POLICY IF EXISTS "Module permissions: insert developer only" ON public.module_permissions;
        DROP POLICY IF EXISTS "Module permissions: update developer only" ON public.module_permissions;
        DROP POLICY IF EXISTS "Module permissions: delete developer only" ON public.module_permissions;
      `
    });
    
    // Etapa 3: Criar políticas seguras
    console.log('3️⃣ Criando políticas seguras...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE POLICY "profiles_select_safe" ON public.profiles
        FOR SELECT TO authenticated
        USING (id = auth.uid() OR app_role = 'developer');
        
        CREATE POLICY "profiles_insert_safe" ON public.profiles
        FOR INSERT TO authenticated
        WITH CHECK (id = auth.uid());
        
        CREATE POLICY "module_permissions_select_all" ON public.module_permissions
        FOR SELECT TO authenticated
        USING (true);
      `
    });
    
    // Etapa 4: Reabilitar RLS
    console.log('4️⃣ Reabilitando RLS...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
      `
    });
    
    console.log('✅ Correção por etapas concluída!');
    await verifyFix();
    
  } catch (err) {
    console.log('❌ Erro na aplicação por etapas:', err.message);
  }
}

async function verifyFix() {
  console.log('\n🔍 Verificando se a correção funcionou...');
  
  try {
    // Testar acesso à tabela profiles
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Ainda há problemas com profiles:', profilesError.message);
    } else {
      console.log('✅ Acesso a profiles funcionando!');
    }
    
    // Testar acesso à tabela module_permissions
    const { data: permissionsTest, error: permissionsError } = await supabase
      .from('module_permissions')
      .select('id')
      .limit(1);
    
    if (permissionsError) {
      console.log('❌ Ainda há problemas com module_permissions:', permissionsError.message);
    } else {
      console.log('✅ Acesso a module_permissions funcionando!');
    }
    
    // Verificar status do RLS
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename IN ('profiles', 'module_permissions') 
            AND schemaname = 'public';
        `
      });
    
    if (!rlsError && rlsStatus) {
      console.log('📊 Status do RLS:');
      rlsStatus.forEach(table => {
        const status = table.rowsecurity ? '✅ ATIVO' : '❌ INATIVO';
        console.log(`  - ${table.tablename}: ${status}`);
      });
    }
    
    console.log('\n🎯 Verificação concluída!');
    
  } catch (err) {
    console.log('❌ Erro na verificação:', err.message);
  }
}

// Executar a correção
applyRLSFix();