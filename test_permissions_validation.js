import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class PermissionsValidator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(category, test, status, details) {
    const result = {
      category,
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'INFO': 'ℹ️',
      'WARN': '⚠️'
    }[status] || '📝';
    
    console.log(`${statusIcon} [${category}] ${test}: ${details}`);
  }

  async testModulePermissions() {
    this.log('PERMISSÕES', 'Início dos Testes', 'INFO', 'Verificando sistema de permissões...');
    
    try {
      // Testar acesso à tabela module_permissions
      const { data: modulePermissions, error: moduleError } = await supabase
        .from('module_permissions')
        .select('*')
        .limit(5);

      if (moduleError) {
        this.log('PERMISSÕES', 'Tabela module_permissions', 'FAIL', `Erro: ${moduleError.message}`);
      } else {
        this.log('PERMISSÕES', 'Tabela module_permissions', 'PASS', `${modulePermissions.length} registros encontrados`);
      }

      // Testar acesso à tabela user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);

      if (rolesError) {
        this.log('PERMISSÕES', 'Tabela user_roles', 'FAIL', `Erro: ${rolesError.message}`);
      } else {
        this.log('PERMISSÕES', 'Tabela user_roles', 'PASS', `${userRoles.length} registros encontrados`);
      }

      // Testar view user_module_permissions (se existir)
      const { data: userModulePerms, error: viewError } = await supabase
        .from('user_module_permissions')
        .select('*')
        .limit(5);

      if (viewError) {
        this.log('PERMISSÕES', 'View user_module_permissions', 'FAIL', `Erro: ${viewError.message}`);
      } else {
        this.log('PERMISSÕES', 'View user_module_permissions', 'PASS', `${userModulePerms.length} registros encontrados`);
      }

    } catch (error) {
      this.log('PERMISSÕES', 'Teste Geral', 'FAIL', `Erro inesperado: ${error.message}`);
    }
  }

  async testRoleBasedAccess() {
    this.log('RBAC', 'Início dos Testes', 'INFO', 'Testando controle de acesso baseado em roles...');
    
    try {
      // Verificar se existem usuários com roles definidos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(10);

      if (profilesError) {
        this.log('RBAC', 'Profiles com Roles', 'FAIL', `Erro: ${profilesError.message}`);
      } else {
        const rolesCount = profiles.reduce((acc, profile) => {
          const role = profile.role || 'undefined';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});
        
        this.log('RBAC', 'Profiles com Roles', 'PASS', `Distribuição de roles: ${JSON.stringify(rolesCount)}`);
      }

      // Verificar company_memberships para isolamento de dados
      const { data: memberships, error: membershipError } = await supabase
        .from('company_memberships')
        .select('*')
        .limit(5);

      if (membershipError) {
        this.log('RBAC', 'Company Memberships', 'FAIL', `Erro: ${membershipError.message}`);
      } else {
        this.log('RBAC', 'Company Memberships', 'PASS', `${memberships.length} vínculos empresa-usuário encontrados`);
      }

    } catch (error) {
      this.log('RBAC', 'Teste Geral', 'FAIL', `Erro inesperado: ${error.message}`);
    }
  }

  async testRLSPolicies() {
    this.log('RLS', 'Início dos Testes', 'INFO', 'Verificando políticas Row-Level Security...');
    
    const tables = ['profiles', 'companies', 'leads', 'surveys', 'module_permissions', 'user_roles'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            this.log('RLS', `Política ${table}`, 'PASS', 'RLS ativo - acesso negado sem autenticação');
          } else {
            this.log('RLS', `Política ${table}`, 'FAIL', `Erro: ${error.message}`);
          }
        } else {
          this.log('RLS', `Política ${table}`, 'WARN', 'Acesso permitido - RLS pode estar desabilitado');
        }
      } catch (error) {
        this.log('RLS', `Política ${table}`, 'FAIL', `Erro inesperado: ${error.message}`);
      }
    }
  }

  async testAuthenticationFlow() {
    this.log('AUTH', 'Início dos Testes', 'INFO', 'Testando fluxo de autenticação...');
    
    try {
      // Verificar se há sessão ativa
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        this.log('AUTH', 'Verificação de Sessão', 'FAIL', `Erro: ${sessionError.message}`);
      } else {
        if (session.session) {
          this.log('AUTH', 'Verificação de Sessão', 'INFO', 'Sessão ativa encontrada');
        } else {
          this.log('AUTH', 'Verificação de Sessão', 'INFO', 'Nenhuma sessão ativa');
        }
      }

      // Testar registro de usuário temporário
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signUpError) {
        this.log('AUTH', 'Registro de Usuário', 'FAIL', `Erro: ${signUpError.message}`);
      } else {
        this.log('AUTH', 'Registro de Usuário', 'PASS', 'Usuário registrado com sucesso');
        
        // Fazer logout do usuário de teste
        await supabase.auth.signOut();
      }

    } catch (error) {
      this.log('AUTH', 'Teste Geral', 'FAIL', `Erro inesperado: ${error.message}`);
    }
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    const summary = this.results.reduce((acc, result) => {
      acc.total++;
      if (result.status === 'PASS') acc.passed++;
      else if (result.status === 'FAIL') acc.failed++;
      else if (result.status === 'WARN') acc.warnings++;
      else acc.info++;
      return acc;
    }, { total: 0, passed: 0, failed: 0, warnings: 0, info: 0 });

    const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(2) : '0.00';

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        ...summary,
        successRate,
        duration
      },
      results: this.results
    };

    // Salvar relatório
    const fs = await import('fs');
    fs.writeFileSync('permissions-validation-report.json', JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DA VALIDAÇÃO DE PERMISSÕES');
    console.log('='.repeat(50));
    console.log(`Total de testes: ${summary.total}`);
    console.log(`✅ Aprovados: ${summary.passed}`);
    console.log(`❌ Falharam: ${summary.failed}`);
    console.log(`⚠️ Avisos: ${summary.warnings}`);
    console.log(`ℹ️ Informativos: ${summary.info}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    console.log(`⏱️ Tempo total: ${duration}s`);
    console.log(`📄 Relatório salvo em: permissions-validation-report.json`);
    console.log('='.repeat(50));

    // Determinar status geral
    if (summary.failed > 0) {
      console.log('❌ Status: SISTEMA COM PROBLEMAS DE PERMISSÕES');
    } else if (summary.warnings > 0) {
      console.log('⚠️ Status: SISTEMA COM AVISOS DE SEGURANÇA');
    } else {
      console.log('✅ Status: SISTEMA DE PERMISSÕES FUNCIONANDO');
    }

    return report;
  }

  async runAllTests() {
    console.log('🔐 Iniciando Validação do Sistema de Permissões...\n');
    
    await this.testModulePermissions();
    await this.testRoleBasedAccess();
    await this.testRLSPolicies();
    await this.testAuthenticationFlow();
    
    console.log('\n🏁 Validação concluída!');
    return await this.generateReport();
  }
}

// Executar testes
const validator = new PermissionsValidator();
validator.runAllTests().catch(console.error);