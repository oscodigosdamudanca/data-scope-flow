import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Usar a URL e chave pública para tentar executar SQL diretamente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTableDirect() {
  console.log('🔧 Tentando criar tabela module_permissions diretamente...');
  
  // SQL para criar a tabela
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.module_permissions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      role_type TEXT NOT NULL CHECK (role_type IN ('app_role', 'custom_role')),
      role_name TEXT NOT NULL,
      module_name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(role_name, module_name)
    );
  `;

  try {
    // Tentar usar rpc para executar SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });

    if (error) {
      console.log('❌ Erro com rpc exec_sql:', error);
      
      // Tentar inserir dados diretamente na tabela se ela existir
      console.log('🔄 Tentando inserir dados diretamente...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('module_permissions')
        .insert([
          { role_type: 'app_role', role_name: 'developer', module_name: 'leads', is_active: true },
          { role_type: 'app_role', role_name: 'developer', module_name: 'surveys', is_active: true },
          { role_type: 'app_role', role_name: 'developer', module_name: 'raffles', is_active: true },
          { role_type: 'app_role', role_name: 'developer', module_name: 'analytics', is_active: true },
          { role_type: 'app_role', role_name: 'developer', module_name: 'feedback', is_active: true },
          { role_type: 'app_role', role_name: 'admin', module_name: 'leads', is_active: true },
          { role_type: 'app_role', role_name: 'admin', module_name: 'surveys', is_active: true },
          { role_type: 'app_role', role_name: 'admin', module_name: 'raffles', is_active: true },
          { role_type: 'app_role', role_name: 'admin', module_name: 'analytics', is_active: true },
          { role_type: 'app_role', role_name: 'interviewer', module_name: 'leads', is_active: true }
        ]);

      if (insertError) {
        console.log('❌ Erro ao inserir dados:', insertError);
      } else {
        console.log('✅ Dados inseridos com sucesso!');
      }
    } else {
      console.log('✅ Tabela criada com sucesso!', data);
    }
  } catch (err) {
    console.log('❌ Erro geral:', err);
  }

  // Verificar se a tabela existe agora
  console.log('🔍 Verificando se a tabela foi criada...');
  const { data: checkData, error: checkError } = await supabase
    .from('module_permissions')
    .select('*')
    .limit(1);

  if (checkError) {
    console.log('❌ Tabela ainda não existe:', checkError.message);
  } else {
    console.log('✅ Tabela module_permissions existe e está acessível!');
    console.log('📊 Dados na tabela:', checkData);
  }
}

createTableDirect();