import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

console.log('🔍 Verificando tabelas existentes no banco...\n');

async function checkExistingTables() {
  try {
    // Lista todas as tabelas do schema public
    const { data, error } = await supabase
      .rpc('get_table_list');
    
    if (error) {
      console.log('Tentando método alternativo...');
      
      // Método alternativo - tentar acessar cada tabela individualmente
      const expectedTables = [
        'companies', 'profiles', 'leads', 'surveys', 
        'survey_questions', 'survey_responses', 
        'module_permissions', 'raffle_participants',
        'user_roles', 'user_permissions'
      ];
      
      console.log('📋 Verificando tabelas uma por uma:\n');
      
      for (const table of expectedTables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (tableError) {
            console.log(`❌ ${table}: ${tableError.message}`);
          } else {
            console.log(`✅ ${table}: Existe (${tableData || 0} registros)`);
          }
        } catch (err) {
          console.log(`❌ ${table}: ${err.message}`);
        }
      }
    } else {
      console.log('✅ Tabelas encontradas:', data);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkExistingTables();