import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class CriticalIssuesFixer {
  constructor() {
    this.results = {
      diagnostics: {},
      fixes: {},
      errors: []
    };
  }

  async diagnoseCurrentState() {
    console.log('🔍 DIAGNÓSTICO DO ESTADO ATUAL');
    console.log('================================');

    // 1. Verificar estrutura da tabela profiles
    try {
      const { data: profilesColumns, error: profilesError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');

      if (profilesError) {
        console.log('❌ Erro ao verificar estrutura da tabela profiles:', profilesError.message);
        this.results.errors.push(`Profiles structure check: ${profilesError.message}`);
      } else {
        console.log('✅ Estrutura da tabela profiles:');
        profilesColumns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        this.results.diagnostics.profiles_structure = profilesColumns;
      }
    } catch (error) {
      console.log('❌ Erro ao acessar information_schema:', error.message);
      this.results.errors.push(`Information schema access: ${error.message}`);
    }

    // 2. Verificar existência da tabela module_permissions
    try {
      const { data: modulePermissions, error: modulePermError } = await supabase
        .from('module_permissions')
        .select('*')
        .limit(1);

      if (modulePermError) {
        console.log('❌ Erro ao acessar module_permissions:', modulePermError.message);
        this.results.diagnostics.module_permissions_access = false;
        this.results.errors.push(`Module permissions access: ${modulePermError.message}`);
      } else {
        console.log('✅ Tabela module_permissions acessível');
        this.results.diagnostics.module_permissions_access = true;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar module_permissions:', error.message);
      this.results.errors.push(`Module permissions check: ${error.message}`);
    }

    // 3. Verificar existência da view user_module_permissions
    try {
      const { data: userModulePerms, error: userModuleError } = await supabase
        .from('user_module_permissions')
        .select('*')
        .limit(1);

      if (userModuleError) {
        console.log('❌ View user_module_permissions não encontrada:', userModuleError.message);
        this.results.diagnostics.user_module_permissions_view = false;
        this.results.errors.push(`User module permissions view: ${userModuleError.message}`);
      } else {
        console.log('✅ View user_module_permissions acessível');
        this.results.diagnostics.user_module_permissions_view = true;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar user_module_permissions:', error.message);
      this.results.errors.push(`User module permissions view check: ${error.message}`);
    }

    // 4. Verificar status do RLS nas tabelas críticas
    const criticalTables = ['profiles', 'companies', 'leads', 'surveys'];
    
    for (const table of criticalTables) {
      try {
        const { data: rlsStatus, error: rlsError } = await supabase
          .from('pg_tables')
          .select('tablename, rowsecurity')
          .eq('tablename', table)
          .eq('schemaname', 'public');

        if (rlsError) {
          console.log(`❌ Erro ao verificar RLS da tabela ${table}:`, rlsError.message);
          this.results.errors.push(`RLS check ${table}: ${rlsError.message}`);
        } else if (rlsStatus && rlsStatus.length > 0) {
          const isRLSEnabled = rlsStatus[0].rowsecurity;
          console.log(`${isRLSEnabled ? '✅' : '⚠️'} RLS na tabela ${table}: ${isRLSEnabled ? 'HABILITADO' : 'DESABILITADO'}`);
          this.results.diagnostics[`${table}_rls`] = isRLSEnabled;
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar RLS da tabela ${table}:`, error.message);
        this.results.errors.push(`RLS check ${table}: ${error.message}`);
      }
    }

    console.log('\n');
  }

  async fixProfilesStructure() {
    console.log('🔧 CORREÇÃO 1: Estrutura da tabela profiles');
    console.log('===========================================');

    try {
      // Verificar se a coluna email já existe
      const profilesStructure = this.results.diagnostics.profiles_structure;
      const hasEmailColumn = profilesStructure && profilesStructure.some(col => col.column_name === 'email');

      if (!hasEmailColumn) {
        console.log('📝 Adicionando coluna email à tabela profiles...');
        
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255);
            
            -- Criar índice para performance
            CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
            
            -- Comentário para documentação
            COMMENT ON COLUMN profiles.email IS 'Email do usuário para autenticação e comunicação';
          `
        });

        if (alterError) {
          console.log('❌ Erro ao adicionar coluna email:', alterError.message);
          this.results.fixes.profiles_email = false;
          this.results.errors.push(`Add email column: ${alterError.message}`);
        } else {
          console.log('✅ Coluna email adicionada com sucesso');
          this.results.fixes.profiles_email = true;
        }
      } else {
        console.log('✅ Coluna email já existe na tabela profiles');
        this.results.fixes.profiles_email = true;
      }
    } catch (error) {
      console.log('❌ Erro ao corrigir estrutura da tabela profiles:', error.message);
      this.results.fixes.profiles_email = false;
      this.results.errors.push(`Fix profiles structure: ${error.message}`);
    }

    console.log('\n');
  }

  async fixPermissionsSystem() {
    console.log('🔧 CORREÇÃO 2: Sistema de permissões');
    console.log('===================================');

    try {
      // Criar tabela module_permissions se não existir
      if (!this.results.diagnostics.module_permissions_access) {
        console.log('📝 Criando tabela module_permissions...');
        
        const { error: createTableError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS module_permissions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              module_name VARCHAR(100) NOT NULL,
              permission_name VARCHAR(100) NOT NULL,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(module_name, permission_name)
            );

            -- Habilitar RLS
            ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

            -- Política para desenvolvedores (acesso total)
            CREATE POLICY "Developers can manage all module permissions" ON module_permissions
              FOR ALL USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.app_role = 'developer'
                )
              );

            -- Política para outros usuários (apenas leitura)
            CREATE POLICY "Users can view module permissions" ON module_permissions
              FOR SELECT USING (true);

            -- Comentários para documentação
            COMMENT ON TABLE module_permissions IS 'Tabela de permissões por módulo do sistema';
            COMMENT ON COLUMN module_permissions.module_name IS 'Nome do módulo (leads, surveys, etc.)';
            COMMENT ON COLUMN module_permissions.permission_name IS 'Nome da permissão (create, read, update, delete)';
          `
        });

        if (createTableError) {
          console.log('❌ Erro ao criar tabela module_permissions:', createTableError.message);
          this.results.fixes.module_permissions_table = false;
          this.results.errors.push(`Create module_permissions: ${createTableError.message}`);
        } else {
          console.log('✅ Tabela module_permissions criada com sucesso');
          this.results.fixes.module_permissions_table = true;
        }
      } else {
        console.log('✅ Tabela module_permissions já existe');
        this.results.fixes.module_permissions_table = true;
      }

      // Criar view user_module_permissions se não existir
      if (!this.results.diagnostics.user_module_permissions_view) {
        console.log('📝 Criando view user_module_permissions...');
        
        const { error: createViewError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE VIEW user_module_permissions AS
            SELECT 
              p.id as profile_id,
              p.email,
              p.app_role,
              p.company_id,
              mp.module_name,
              mp.permission_name,
              mp.description,
              CASE 
                WHEN p.app_role = 'developer' THEN true
                WHEN p.app_role = 'organizer' AND mp.module_name IN ('feedback', 'surveys', 'analytics') THEN true
                WHEN p.app_role = 'admin' AND mp.module_name IN ('leads', 'raffles', 'analytics') THEN true
                WHEN p.app_role = 'interviewer' AND mp.module_name = 'leads' AND mp.permission_name IN ('create', 'read') THEN true
                ELSE false
              END as has_permission
            FROM profiles p
            CROSS JOIN module_permissions mp
            WHERE p.id = auth.uid() OR p.app_role = 'developer';

            -- Comentário para documentação
            COMMENT ON VIEW user_module_permissions IS 'View que combina usuários com suas permissões por módulo baseado no role';
          `
        });

        if (createViewError) {
          console.log('❌ Erro ao criar view user_module_permissions:', createViewError.message);
          this.results.fixes.user_module_permissions_view = false;
          this.results.errors.push(`Create user_module_permissions view: ${createViewError.message}`);
        } else {
          console.log('✅ View user_module_permissions criada com sucesso');
          this.results.fixes.user_module_permissions_view = true;
        }
      } else {
        console.log('✅ View user_module_permissions já existe');
        this.results.fixes.user_module_permissions_view = true;
      }

    } catch (error) {
      console.log('❌ Erro ao corrigir sistema de permissões:', error.message);
      this.results.fixes.permissions_system = false;
      this.results.errors.push(`Fix permissions system: ${error.message}`);
    }

    console.log('\n');
  }

  async enableRLSOnCriticalTables() {
    console.log('🔧 CORREÇÃO 3: Habilitar RLS nas tabelas críticas');
    console.log('================================================');

    const criticalTables = ['profiles', 'companies', 'leads', 'surveys'];
    
    for (const table of criticalTables) {
      try {
        const isRLSEnabled = this.results.diagnostics[`${table}_rls`];
        
        if (!isRLSEnabled) {
          console.log(`📝 Habilitando RLS na tabela ${table}...`);
          
          const { error: enableRLSError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
          });

          if (enableRLSError) {
            console.log(`❌ Erro ao habilitar RLS na tabela ${table}:`, enableRLSError.message);
            this.results.fixes[`${table}_rls_enabled`] = false;
            this.results.errors.push(`Enable RLS ${table}: ${enableRLSError.message}`);
          } else {
            console.log(`✅ RLS habilitado na tabela ${table}`);
            this.results.fixes[`${table}_rls_enabled`] = true;
          }
        } else {
          console.log(`✅ RLS já habilitado na tabela ${table}`);
          this.results.fixes[`${table}_rls_enabled`] = true;
        }
      } catch (error) {
        console.log(`❌ Erro ao processar RLS da tabela ${table}:`, error.message);
        this.results.fixes[`${table}_rls_enabled`] = false;
        this.results.errors.push(`Process RLS ${table}: ${error.message}`);
      }
    }

    console.log('\n');
  }

  async implementRLSPolicies() {
    console.log('🔧 CORREÇÃO 4: Implementar políticas RLS adequadas');
    console.log('=================================================');

    try {
      console.log('📝 Criando políticas RLS para isolamento por empresa...');
      
      const { error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Remover políticas existentes que possam estar conflitando
          DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
          DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
          DROP POLICY IF EXISTS "Company members can view company data" ON companies;
          DROP POLICY IF EXISTS "Company members can view company leads" ON leads;
          DROP POLICY IF EXISTS "Company members can manage company surveys" ON surveys;

          -- POLÍTICAS PARA PROFILES
          CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);

          CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);

          CREATE POLICY "Developers can manage all profiles" ON profiles
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role = 'developer'
              )
            );

          -- POLÍTICAS PARA COMPANIES
          CREATE POLICY "Company members can view their company" ON companies
            FOR SELECT USING (
              id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role IN ('developer', 'organizer')
              )
            );

          CREATE POLICY "Admins can update their company" ON companies
            FOR UPDATE USING (
              id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role IN ('admin', 'developer')
              )
            );

          -- POLÍTICAS PARA LEADS
          CREATE POLICY "Company members can view their leads" ON leads
            FOR SELECT USING (
              company_id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role IN ('developer', 'organizer')
              )
            );

          CREATE POLICY "Company members can create leads" ON leads
            FOR INSERT WITH CHECK (
              company_id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid()
                AND profiles.app_role IN ('admin', 'interviewer')
              )
              OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role = 'developer'
              )
            );

          -- POLÍTICAS PARA SURVEYS
          CREATE POLICY "Company members can view their surveys" ON surveys
            FOR SELECT USING (
              company_id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid()
              )
              OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role IN ('developer', 'organizer')
              )
            );

          CREATE POLICY "Admins can manage their surveys" ON surveys
            FOR ALL USING (
              company_id IN (
                SELECT company_id FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.app_role IN ('admin', 'developer')
              )
            );
        `
      });

      if (policiesError) {
        console.log('❌ Erro ao criar políticas RLS:', policiesError.message);
        this.results.fixes.rls_policies = false;
        this.results.errors.push(`Create RLS policies: ${policiesError.message}`);
      } else {
        console.log('✅ Políticas RLS criadas com sucesso');
        this.results.fixes.rls_policies = true;
      }

    } catch (error) {
      console.log('❌ Erro ao implementar políticas RLS:', error.message);
      this.results.fixes.rls_policies = false;
      this.results.errors.push(`Implement RLS policies: ${error.message}`);
    }

    console.log('\n');
  }

  async populateDefaultPermissions() {
    console.log('🔧 CORREÇÃO 5: Popular dados de permissões padrão');
    console.log('===============================================');

    try {
      console.log('📝 Inserindo permissões padrão do sistema...');
      
      const { error: insertError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO module_permissions (module_name, permission_name, description) VALUES
          ('leads', 'create', 'Criar novos leads'),
          ('leads', 'read', 'Visualizar leads'),
          ('leads', 'update', 'Editar leads existentes'),
          ('leads', 'delete', 'Excluir leads'),
          ('surveys', 'create', 'Criar pesquisas'),
          ('surveys', 'read', 'Visualizar pesquisas'),
          ('surveys', 'update', 'Editar pesquisas'),
          ('surveys', 'delete', 'Excluir pesquisas'),
          ('raffles', 'create', 'Criar sorteios'),
          ('raffles', 'read', 'Visualizar sorteios'),
          ('raffles', 'execute', 'Executar sorteios'),
          ('analytics', 'read', 'Visualizar relatórios'),
          ('analytics', 'export', 'Exportar dados'),
          ('feedback', 'create', 'Criar feedback'),
          ('feedback', 'read', 'Visualizar feedback'),
          ('admin', 'users', 'Gerenciar usuários'),
          ('admin', 'companies', 'Gerenciar empresas'),
          ('admin', 'system', 'Configurações do sistema')
          ON CONFLICT (module_name, permission_name) DO NOTHING;
        `
      });

      if (insertError) {
        console.log('❌ Erro ao inserir permissões padrão:', insertError.message);
        this.results.fixes.default_permissions = false;
        this.results.errors.push(`Insert default permissions: ${insertError.message}`);
      } else {
        console.log('✅ Permissões padrão inseridas com sucesso');
        this.results.fixes.default_permissions = true;
      }

    } catch (error) {
      console.log('❌ Erro ao popular permissões padrão:', error.message);
      this.results.fixes.default_permissions = false;
      this.results.errors.push(`Populate default permissions: ${error.message}`);
    }

    console.log('\n');
  }

  async generateFinalReport() {
    console.log('📊 RELATÓRIO FINAL DAS CORREÇÕES');
    console.log('================================');

    const totalFixes = Object.keys(this.results.fixes).length;
    const successfulFixes = Object.values(this.results.fixes).filter(Boolean).length;
    const successRate = totalFixes > 0 ? (successfulFixes / totalFixes * 100).toFixed(2) : 0;

    console.log(`✅ Correções bem-sucedidas: ${successfulFixes}/${totalFixes} (${successRate}%)`);
    console.log(`❌ Erros encontrados: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERROS DETALHADOS:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Salvar relatório em arquivo
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_fixes: totalFixes,
        successful_fixes: successfulFixes,
        success_rate: `${successRate}%`,
        total_errors: this.results.errors.length
      },
      diagnostics: this.results.diagnostics,
      fixes: this.results.fixes,
      errors: this.results.errors
    };

    // Salvar relatório
    const fs = await import('fs');
    fs.writeFileSync('critical-fixes-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório salvo em: critical-fixes-report.json');

    return report;
  }

  async executeAllFixes() {
    console.log('🚀 INICIANDO CORREÇÕES CRÍTICAS DO MCP SUPABASE');
    console.log('===============================================\n');

    await this.diagnoseCurrentState();
    await this.fixProfilesStructure();
    await this.fixPermissionsSystem();
    await this.enableRLSOnCriticalTables();
    await this.implementRLSPolicies();
    await this.populateDefaultPermissions();
    
    return await this.generateFinalReport();
  }
}

// Executar correções
const fixer = new CriticalIssuesFixer();
fixer.executeAllFixes()
  .then(report => {
    console.log('\n🎉 CORREÇÕES CONCLUÍDAS!');
    console.log(`Taxa de sucesso: ${report.summary.success_rate}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal durante as correções:', error);
    process.exit(1);
  });