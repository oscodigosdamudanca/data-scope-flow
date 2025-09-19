import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function createModulePermissionsTable() {
  try {
    console.log('🔧 Criando tabela module_permissions...\n');
    
    // SQL para criar a tabela module_permissions
    const createTableSQL = `
      -- Criar tabela module_permissions
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

      -- Ativar RLS
      ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

      -- Criar política para desenvolvedores
      CREATE POLICY "Developers can manage all module permissions" ON public.module_permissions
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'gilberto@datascope.com.br'
          )
        );

      -- Criar índice para performance
      CREATE INDEX IF NOT EXISTS idx_module_permissions_role_module 
        ON public.module_permissions(role_name, module_name);

      -- Função para verificar permissões de módulo
      CREATE OR REPLACE FUNCTION public.check_module_permission(
        p_role_name TEXT,
        p_module_name TEXT
      ) RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.module_permissions
          WHERE role_name = p_role_name
          AND module_name = p_module_name
          AND is_active = true
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Inserir permissões padrão
      INSERT INTO public.module_permissions (role_type, role_name, module_name, is_active) VALUES
        ('app_role', 'developer', 'leads', true),
        ('app_role', 'developer', 'surveys', true),
        ('app_role', 'developer', 'raffles', true),
        ('app_role', 'developer', 'analytics', true),
        ('app_role', 'developer', 'feedback', true),
        ('app_role', 'organizer', 'surveys', true),
        ('app_role', 'organizer', 'analytics', true),
        ('app_role', 'organizer', 'feedback', true),
        ('app_role', 'admin', 'leads', true),
        ('app_role', 'admin', 'surveys', true),
        ('app_role', 'admin', 'raffles', true),
        ('app_role', 'admin', 'analytics', true),
        ('app_role', 'interviewer', 'leads', true)
      ON CONFLICT (role_name, module_name) DO NOTHING;
    `;

    // Executar o SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });

    if (error) {
      console.error('❌ Erro ao criar tabela:', error);
      
      // Tentar método alternativo - executar cada comando separadamente
      console.log('🔄 Tentando método alternativo...');
      
      const commands = createTableSQL.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim()) {
          try {
            const { error: cmdError } = await supabase.rpc('exec_sql', {
              sql_query: command.trim() + ';'
            });
            
            if (cmdError) {
              console.log('⚠️ Comando falhou:', command.substring(0, 50) + '...', cmdError.message);
            } else {
              console.log('✅ Comando executado:', command.substring(0, 50) + '...');
            }
          } catch (err) {
            console.log('⚠️ Erro no comando:', err.message);
          }
        }
      }
    } else {
      console.log('✅ Tabela module_permissions criada com sucesso!');
    }

    // Verificar se a tabela foi criada
    const { data: checkData, error: checkError } = await supabase
      .from('module_permissions')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);

    if (!checkError) {
      console.log('✅ Verificação: Tabela module_permissions está acessível');
      
      // Listar algumas permissões
      const { data: permissions, error: permError } = await supabase
        .from('module_permissions')
        .select('*')
        .limit(5);
      
      if (!permError && permissions) {
        console.log('📋 Permissões encontradas:', permissions.length);
        permissions.forEach(perm => {
          console.log(`  - ${perm.role_name}: ${perm.module_name} (${perm.is_active ? 'ativo' : 'inativo'})`);
        });
      }
    } else {
      console.log('❌ Tabela ainda não está acessível:', checkError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createModulePermissionsTable();