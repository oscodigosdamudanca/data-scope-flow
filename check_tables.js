import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco de dados...\n');
    
    // Verificar se a tabela module_permissions existe
    const { data, error } = await supabase
      .from('module_permissions')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.log('❌ Tabela module_permissions não existe:', error.message);
    } else {
      console.log('✅ Tabela module_permissions existe');
    }
    
    // Listar algumas tabelas existentes
    const tablesToCheck = [
      'companies',
      'profiles', 
      'user_roles',
      'leads',
      'surveys',
      'raffle_participants',
      'user_permissions',
      'module_permissions'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true })
          .limit(1);
        
        if (!tableError) {
          console.log(`✅ Tabela ${table} existe`);
        } else {
          console.log(`❌ Tabela ${table} não existe:`, tableError.message);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar tabela ${table}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('Erro geral ao verificar tabelas:', error);
  }
}

checkTables();