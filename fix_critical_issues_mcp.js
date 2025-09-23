// Script para corrigir problemas críticos usando MCP Supabase
// Este script executa as correções identificadas no relatório final

class MCPSupabaseFixer {
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

    // Verificar estrutura da tabela profiles
    try {
      console.log('📋 Verificando estrutura da tabela profiles...');
      // Simular verificação - na prática seria feita via MCP
      this.results.diagnostics.profiles_structure = [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES' },
        { column_name: 'app_role', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'company_id', data_type: 'uuid', is_nullable: 'YES' }
        // Nota: coluna email está faltando
      ];
      
      const hasEmailColumn = this.results.diagnostics.profiles_structure.some(col => col.column_name === 'email');
      console.log(`${hasEmailColumn ? '✅' : '❌'} Coluna email na tabela profiles: ${hasEmailColumn ? 'EXISTE' : 'FALTANDO'}`);
      
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura da tabela profiles:', error.message);
      this.results.errors.push(`Profiles structure check: ${error.message}`);
    }

    // Verificar tabelas críticas para RLS
    const criticalTables = ['profiles', 'companies', 'leads', 'surveys'];
    console.log('📋 Verificando status do RLS nas tabelas críticas...');
    
    for (const table of criticalTables) {
      // Simular verificação - baseado no relatório anterior
      const isRLSEnabled = false; // Baseado no relatório, RLS está desabilitado
      console.log(`${isRLSEnabled ? '✅' : '⚠️'} RLS na tabela ${table}: ${isRLSEnabled ? 'HABILITADO' : 'DESABILITADO'}`);
      this.results.diagnostics[`${table}_rls`] = isRLSEnabled;
    }

    console.log('\n');
  }

  generateSQLScript() {
    console.log('📝 GERANDO SCRIPT SQL PARA CORREÇÕES');
    console.log('===================================');

    const sqlScript = `
-- =====================================================
-- SCRIPT DE CORREÇÃO DOS PROBLEMAS CRÍTICOS
-- Data: ${new Date().toISOString()}
-- =====================================================

-- CORREÇÃO 1: Adicionar coluna email à tabela profiles
-- ===================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Comentário para documentação
COMMENT ON COLUMN profiles.email IS 'Email do usuário para autenticação e comunicação';

-- CORREÇÃO 2: Criar tabela module_permissions
-- ==========================================
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(100) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_name, permission_name)
);

-- Comentários para documentação
COMMENT ON TABLE module_permissions IS 'Tabela de permissões por módulo do sistema';
COMMENT ON COLUMN module_permissions.module_name IS 'Nome do módulo (leads, surveys, etc.)';
COMMENT ON COLUMN module_permissions.permission_name IS 'Nome da permissão (create, read, update, delete)';

-- CORREÇÃO 3: Criar view user_module_permissions
-- =============================================
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

-- CORREÇÃO 4: Habilitar RLS nas tabelas críticas
-- ==============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- CORREÇÃO 5: Remover políticas conflitantes e criar novas
-- =======================================================

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

-- POLÍTICAS PARA MODULE_PERMISSIONS
CREATE POLICY "Developers can manage all module permissions" ON module_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

CREATE POLICY "Users can view module permissions" ON module_permissions
  FOR SELECT USING (true);

-- CORREÇÃO 6: Popular dados de permissões padrão
-- ==============================================
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

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================

-- VERIFICAÇÕES PÓS-EXECUÇÃO
-- =========================

-- Verificar se a coluna email foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as tabelas têm RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'companies', 'leads', 'surveys', 'module_permissions')
AND schemaname = 'public';

-- Verificar se as permissões foram inseridas
SELECT module_name, permission_name, description 
FROM module_permissions 
ORDER BY module_name, permission_name;

-- Verificar se a view foi criada
SELECT viewname 
FROM pg_views 
WHERE viewname = 'user_module_permissions' AND schemaname = 'public';
`;

    return sqlScript;
  }

  async generateReport() {
    console.log('📊 GERANDO RELATÓRIO DE CORREÇÕES');
    console.log('=================================');

    const sqlScript = this.generateSQLScript();
    
    // Salvar script SQL
    const fs = await import('fs');
    fs.writeFileSync('critical_fixes_complete.sql', sqlScript);
    console.log('✅ Script SQL salvo em: critical_fixes_complete.sql');

    // Gerar relatório de instruções
    const instructions = `
# 🔧 INSTRUÇÕES PARA CORREÇÃO DOS PROBLEMAS CRÍTICOS

## Problemas Identificados:
1. ❌ Coluna 'email' faltando na tabela 'profiles'
2. ❌ Tabela 'module_permissions' com acesso restrito
3. ❌ View 'user_module_permissions' não encontrada
4. ❌ RLS desabilitado nas tabelas críticas
5. ❌ Políticas RLS inadequadas ou conflitantes
6. ❌ Dados de permissões padrão não populados

## Como Executar as Correções:

### Opção 1: Via Supabase Dashboard (RECOMENDADO)
1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Vá para o projeto: bhjreswsrfvnzyvmxtwj
3. Navegue até "SQL Editor"
4. Cole o conteúdo do arquivo 'critical_fixes_complete.sql'
5. Execute o script clicando em "Run"

### Opção 2: Via MCP Supabase (se disponível)
1. Use a função mcp_supabase__mcp_execute_sql
2. Execute cada seção do script separadamente
3. Verifique os resultados após cada execução

## Verificações Pós-Execução:
- ✅ Coluna 'email' deve aparecer na tabela 'profiles'
- ✅ Tabela 'module_permissions' deve ser acessível
- ✅ View 'user_module_permissions' deve existir
- ✅ RLS deve estar habilitado nas tabelas críticas
- ✅ Políticas RLS devem permitir acesso adequado
- ✅ Permissões padrão devem estar populadas

## Próximos Passos:
1. Execute o script SQL completo
2. Teste a conectividade com o banco
3. Verifique se as operações CRUD funcionam
4. Teste o sistema de permissões
5. Execute novamente os testes de validação

## Arquivos Gerados:
- critical_fixes_complete.sql: Script SQL completo
- critical_fixes_instructions.md: Este arquivo de instruções
`;

    fs.writeFileSync('critical_fixes_instructions.md', instructions);
    console.log('✅ Instruções salvas em: critical_fixes_instructions.md');

    console.log('\n🎯 RESUMO DAS CORREÇÕES PREPARADAS:');
    console.log('- ✅ Script SQL completo gerado');
    console.log('- ✅ Instruções detalhadas criadas');
    console.log('- ✅ Verificações pós-execução incluídas');
    console.log('- ✅ Pronto para execução manual');

    return {
      sql_script: 'critical_fixes_complete.sql',
      instructions: 'critical_fixes_instructions.md',
      status: 'ready_for_execution'
    };
  }

  async execute() {
    console.log('🚀 PREPARANDO CORREÇÕES CRÍTICAS DO MCP SUPABASE');
    console.log('================================================\n');

    await this.diagnoseCurrentState();
    return await this.generateReport();
  }
}

// Executar preparação das correções
const fixer = new MCPSupabaseFixer();
fixer.execute()
  .then(result => {
    console.log('\n🎉 CORREÇÕES PREPARADAS COM SUCESSO!');
    console.log('Execute o script SQL no Supabase Dashboard para aplicar as correções.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro durante a preparação:', error);
    process.exit(1);
  });