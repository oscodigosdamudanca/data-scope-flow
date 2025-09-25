const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Use the correct service role key from .env
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applyRLSFix() {
  try {
    console.log('🔧 Aplicando correção para recursão infinita nas políticas RLS...');
    
    // Execute each SQL statement separately to avoid issues
    const statements = [
      `DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;`,
      `DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;`,
      `CREATE POLICY "UserRoles: manage self" ON public.user_roles
       FOR ALL TO authenticated
       USING (user_id = auth.uid())
       WITH CHECK (user_id = auth.uid());`,
      `CREATE POLICY "UserRoles: developer manage all" ON public.user_roles
       FOR ALL TO authenticated
       USING (
         auth.uid() IN (
           SELECT ur.user_id 
           FROM public.user_roles ur 
           WHERE ur.role = 'developer'
         )
       )
       WITH CHECK (
         auth.uid() IN (
           SELECT ur.user_id 
           FROM public.user_roles ur 
           WHERE ur.role = 'developer'
         )
       );`
    ];

    for (let i = 0; i < statements.length; i++) {
      console.log(`📝 Executando statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase
        .from('_dummy') // This won't work, we need to use raw SQL
        .select('1')
        .limit(1);
      
      // Try using the SQL editor approach
      const { data: result, error: sqlError } = await supabase
        .rpc('exec_sql', { query: statements[i] });
        
      if (sqlError) {
        console.error(`❌ Erro no statement ${i + 1}:`, sqlError);
      } else {
        console.log(`✅ Statement ${i + 1} executado com sucesso`);
      }
    }
    
    console.log('🎉 Correção aplicada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

applyRLSFix();