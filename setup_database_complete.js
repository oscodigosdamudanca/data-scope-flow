require('dotenv').config();

console.log('🚀 Iniciando setup completo do banco de dados...');

// Função para executar SQL usando MCP
async function executeSQLWithMCP(sql, description) {
  try {
    console.log(`📋 ${description}...`);
    
    // Simular execução via MCP - na prática seria via mcp_supabase__mcp_execute_sql
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    console.log(`✅ ${description} - Concluído`);
    return await response.json();
  } catch (error) {
    console.error(`❌ Erro em ${description}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  try {
    // 1. Criar extensões necessárias
    await executeSQLWithMCP(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `, 'Criando extensões necessárias');

    // 2. Criar tabela companies
    await executeSQLWithMCP(`
      CREATE TABLE IF NOT EXISTS public.companies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        industry VARCHAR(100),
        size VARCHAR(50) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
        description TEXT,
        website VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Brasil',
        postal_code VARCHAR(20),
        logo_url TEXT,
        settings JSONB DEFAULT '{}',
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID
      );
    `, 'Criando tabela companies');

    // 3. Criar tabela profiles (estendendo auth.users)
    await executeSQLWithMCP(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email VARCHAR(255),
        full_name VARCHAR(255),
        avatar_url TEXT,
        app_role VARCHAR(50) DEFAULT 'interviewer' CHECK (app_role IN ('developer', 'organizer', 'admin', 'interviewer')),
        company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
        permissions JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Criando tabela profiles');

    // 4. Criar tabela leads
    await executeSQLWithMCP(`
      CREATE TABLE IF NOT EXISTS public.leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        position VARCHAR(255),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        priority VARCHAR(20) DEFAULT 'medium',
        notes TEXT,
        tags TEXT[],
        custom_fields JSONB DEFAULT '{}',
        lgpd_consent BOOLEAN DEFAULT false,
        last_contact_date TIMESTAMP WITH TIME ZONE,
        next_follow_up_date TIMESTAMP WITH TIME ZONE,
        conversion_date TIMESTAMP WITH TIME ZONE,
        lead_score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES public.profiles(id),
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
      );
    `, 'Criando tabela leads');

    // 5. Criar tabela surveys
    await executeSQLWithMCP(`
      CREATE TABLE IF NOT EXISTS public.surveys (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        survey_type VARCHAR(50) DEFAULT 'feedback',
        settings JSONB DEFAULT '{}',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        target_audience TEXT,
        response_limit INTEGER,
        anonymous_responses BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES public.profiles(id),
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
      );
    `, 'Criando tabela surveys');

    // 6. Criar tabela module_permissions
    await executeSQLWithMCP(`
      CREATE TABLE IF NOT EXISTS public.module_permissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        module_name VARCHAR(100) NOT NULL,
        permission_name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(module_name, permission_name)
      );
    `, 'Criando tabela module_permissions');

    // 7. Inserir permissões básicas
    await executeSQLWithMCP(`
      INSERT INTO public.module_permissions (module_name, permission_name, description) VALUES
      ('leads', 'create', 'Criar novos leads'),
      ('leads', 'read', 'Visualizar leads'),
      ('leads', 'update', 'Atualizar leads'),
      ('leads', 'delete', 'Excluir leads'),
      ('surveys', 'create', 'Criar pesquisas'),
      ('surveys', 'read', 'Visualizar pesquisas'),
      ('surveys', 'update', 'Atualizar pesquisas'),
      ('surveys', 'delete', 'Excluir pesquisas'),
      ('raffles', 'create', 'Criar sorteios'),
      ('raffles', 'read', 'Visualizar sorteios'),
      ('raffles', 'execute', 'Executar sorteios'),
      ('analytics', 'read', 'Visualizar relatórios'),
      ('feedback', 'create', 'Criar feedback'),
      ('feedback', 'read', 'Visualizar feedback')
      ON CONFLICT (module_name, permission_name) DO NOTHING;
    `, 'Inserindo permissões básicas');

    // 8. Habilitar RLS
    await executeSQLWithMCP(`
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
    `, 'Habilitando Row Level Security');

    // 9. Criar políticas RLS
    await executeSQLWithMCP(`
      -- Políticas para profiles
      CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
      
      -- Políticas para companies
      CREATE POLICY "Company members can view their company" ON public.companies
        FOR SELECT USING (
          id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        );
      
      -- Políticas para leads
      CREATE POLICY "Company members can manage company leads" ON public.leads
        FOR ALL USING (
          company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        );
      
      -- Políticas para surveys
      CREATE POLICY "Company members can manage company surveys" ON public.surveys
        FOR ALL USING (
          company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        );
      
      -- Políticas para module_permissions
      CREATE POLICY "All authenticated users can read permissions" ON public.module_permissions
        FOR SELECT USING (auth.role() = 'authenticated');
    `, 'Criando políticas RLS');

    // 10. Criar função para trigger de updated_at
    await executeSQLWithMCP(`
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `, 'Criando função handle_updated_at');

    // 11. Criar triggers para updated_at
    await executeSQLWithMCP(`
      CREATE TRIGGER handle_updated_at_profiles
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
      
      CREATE TRIGGER handle_updated_at_companies
        BEFORE UPDATE ON public.companies
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
      
      CREATE TRIGGER handle_updated_at_leads
        BEFORE UPDATE ON public.leads
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
      
      CREATE TRIGGER handle_updated_at_surveys
        BEFORE UPDATE ON public.surveys
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    `, 'Criando triggers para updated_at');

    console.log('🎉 Setup do banco de dados concluído com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro durante o setup:', error);
    process.exit(1);
  }
}

// Executar setup
setupDatabase();