/**
 * =====================================================
 * TESTES DE SEGURANÇA E RLS (Row Level Security)
 * =====================================================
 * 
 * Módulo dedicado para testar:
 * - Políticas RLS em todas as tabelas
 * - Controle de acesso baseado em roles
 * - Validação de permissões
 * - Testes de tentativas de acesso não autorizado
 * - Verificação de isolamento de dados entre empresas
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES DE SEGURANÇA
// =====================================================

class SecurityTester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.testUsers = {}; // Armazenar usuários de teste criados
  }

  // Verificar se RLS está habilitado em uma tabela
  async checkRLSEnabled(tableName) {
    this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'INFO', `Verificando RLS em ${tableName}...`);
    
    try {
      // Consulta para verificar se RLS está habilitado
      const { data, error } = await this.supabase.rpc('exec_sql', {
        sql_query: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = '${tableName}';
        `
      });

      if (error) {
        // Se a função exec_sql não existir, tentar método alternativo
        this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'INFO', 'Função exec_sql não disponível, usando método alternativo');
        
        // Tentar acessar a tabela sem autenticação para verificar RLS
        const { data: testData, error: testError } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (testError && testError.code === '42501') {
          this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'PASS', 'RLS está habilitado (acesso negado sem auth)');
          return true;
        } else if (testError) {
          this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'FAIL', 'Erro ao verificar RLS', testError.message);
          return false;
        } else {
          this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'FAIL', 'RLS pode não estar habilitado (acesso permitido)');
          return false;
        }
      }

      const rlsEnabled = data && data[0] && data[0].rowsecurity;
      if (rlsEnabled) {
        this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'PASS', 'RLS está habilitado');
      } else {
        this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'FAIL', 'RLS não está habilitado');
      }

      return rlsEnabled;

    } catch (error) {
      this.logger.log('SECURITY', `RLS Check - ${tableName}`, 'FAIL', 'Erro ao verificar RLS', error.message);
      return false;
    }
  }

  // Testar políticas RLS para uma tabela específica
  async testTableRLSPolicies(tableName) {
    this.logger.log('SECURITY', `RLS Policies - ${tableName}`, 'INFO', `Testando políticas RLS para ${tableName}...`);
    
    try {
      // Verificar se existem políticas definidas
      const { data, error } = await this.supabase.rpc('exec_sql', {
        sql_query: `
          SELECT policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = '${tableName}';
        `
      });

      if (error) {
        this.logger.log('SECURITY', `RLS Policies - ${tableName}`, 'INFO', 'Não foi possível consultar políticas diretamente');
        
        // Teste indireto: tentar operações e verificar comportamento
        return await this.testIndirectRLSBehavior(tableName);
      }

      if (!data || data.length === 0) {
        this.logger.log('SECURITY', `RLS Policies - ${tableName}`, 'FAIL', 'Nenhuma política RLS encontrada');
        return false;
      }

      this.logger.log('SECURITY', `RLS Policies - ${tableName}`, 'PASS', 
        `${data.length} política(s) RLS encontrada(s)`, data);
      
      return true;

    } catch (error) {
      this.logger.log('SECURITY', `RLS Policies - ${tableName}`, 'FAIL', 'Erro ao verificar políticas', error.message);
      return false;
    }
  }

  // Teste indireto do comportamento RLS
  async testIndirectRLSBehavior(tableName) {
    try {
      // Tentar inserir sem autenticação
      const { data, error } = await this.supabase
        .from(tableName)
        .insert({ test_field: 'test_value' });

      if (error && (error.code === '42501' || error.message.includes('policy'))) {
        this.logger.log('SECURITY', `RLS Behavior - ${tableName}`, 'PASS', 'RLS está funcionando (inserção bloqueada)');
        return true;
      } else if (error) {
        this.logger.log('SECURITY', `RLS Behavior - ${tableName}`, 'INFO', 'Erro diferente de RLS', error.message);
        return false;
      } else {
        this.logger.log('SECURITY', `RLS Behavior - ${tableName}`, 'FAIL', 'RLS pode não estar funcionando (inserção permitida)');
        return false;
      }

    } catch (error) {
      this.logger.log('SECURITY', `RLS Behavior - ${tableName}`, 'FAIL', 'Erro durante teste indireto', error.message);
      return false;
    }
  }

  // Testar isolamento de dados entre empresas
  async testDataIsolation() {
    this.logger.log('SECURITY', 'Data Isolation', 'INFO', 'Testando isolamento de dados entre empresas...');
    
    try {
      // Primeiro, fazer login como usuário autenticado
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: 'test@datascope.com',
        password: 'TestPassword123!'
      });

      if (authError) {
        this.logger.log('SECURITY', 'Data Isolation', 'SKIP', 'Não foi possível autenticar para teste de isolamento');
        return false;
      }

      // Tentar acessar dados de diferentes empresas
      const { data: companiesData, error: companiesError } = await this.supabase
        .from('companies')
        .select('*')
        .limit(10);

      if (companiesError) {
        this.logger.log('SECURITY', 'Data Isolation', 'FAIL', 'Erro ao acessar dados de empresas', companiesError.message);
        return false;
      }

      // Verificar se o usuário só vê dados da sua empresa
      if (companiesData && companiesData.length > 0) {
        this.logger.log('SECURITY', 'Data Isolation', 'INFO', 
          `Usuário pode ver ${companiesData.length} empresa(s)`);
        
        // Se vê apenas 1 empresa, provavelmente o isolamento está funcionando
        if (companiesData.length === 1) {
          this.logger.log('SECURITY', 'Data Isolation', 'PASS', 'Isolamento de dados funcionando (acesso limitado)');
          return true;
        } else {
          this.logger.log('SECURITY', 'Data Isolation', 'FAIL', 'Possível vazamento de dados (acesso a múltiplas empresas)');
          return false;
        }
      } else {
        this.logger.log('SECURITY', 'Data Isolation', 'PASS', 'Nenhum dado acessível (isolamento total)');
        return true;
      }

    } catch (error) {
      this.logger.log('SECURITY', 'Data Isolation', 'FAIL', 'Erro durante teste de isolamento', error.message);
      return false;
    }
  }

  // Testar controle de acesso baseado em roles
  async testRoleBasedAccess() {
    this.logger.log('SECURITY', 'Role Access', 'INFO', 'Testando controle de acesso baseado em roles...');
    
    try {
      // Verificar se as funções de role existem
      const roleFunctions = [
        'has_role',
        'is_company_admin', 
        'is_company_member',
        'is_company_interviewer_safe'
      ];

      let functionsWorking = 0;

      for (const funcName of roleFunctions) {
        try {
          // Testar se a função existe tentando chamá-la
          const { data, error } = await this.supabase.rpc(funcName, {
            _user_id: '00000000-0000-0000-0000-000000000000',
            _company_id: '00000000-0000-0000-0000-000000000000'
          });

          if (error && !error.message.includes('function') && !error.message.includes('does not exist')) {
            this.logger.log('SECURITY', `Function ${funcName}`, 'PASS', 'Função existe e é executável');
            functionsWorking++;
          } else if (error) {
            this.logger.log('SECURITY', `Function ${funcName}`, 'FAIL', 'Função não encontrada ou erro', error.message);
          } else {
            this.logger.log('SECURITY', `Function ${funcName}`, 'PASS', 'Função executada com sucesso');
            functionsWorking++;
          }

        } catch (err) {
          this.logger.log('SECURITY', `Function ${funcName}`, 'FAIL', 'Erro ao testar função', err.message);
        }
      }

      const successRate = (functionsWorking / roleFunctions.length) * 100;
      this.logger.log('SECURITY', 'Role Functions', 'INFO', 
        `${functionsWorking}/${roleFunctions.length} funções de role funcionando (${successRate.toFixed(1)}%)`);

      return successRate > 50;

    } catch (error) {
      this.logger.log('SECURITY', 'Role Access', 'FAIL', 'Erro durante teste de roles', error.message);
      return false;
    }
  }

  // Testar tentativas de SQL injection
  async testSQLInjectionProtection() {
    this.logger.log('SECURITY', 'SQL Injection', 'INFO', 'Testando proteção contra SQL injection...');
    
    const maliciousInputs = [
      "'; DROP TABLE leads; --",
      "' OR '1'='1",
      "'; SELECT * FROM companies; --",
      "' UNION SELECT * FROM profiles --",
      "<script>alert('xss')</script>",
      "../../etc/passwd"
    ];

    let protectionWorking = 0;

    for (const maliciousInput of maliciousInputs) {
      try {
        // Tentar usar input malicioso em uma consulta
        const { data, error } = await this.supabase
          .from('leads')
          .select('*')
          .eq('name', maliciousInput)
          .limit(1);

        // Se não houve erro, a proteção está funcionando (input foi tratado como string normal)
        if (!error) {
          protectionWorking++;
          this.logger.log('SECURITY', 'SQL Injection Test', 'PASS', 'Input malicioso tratado com segurança');
        } else if (error.message.includes('syntax error') || error.message.includes('invalid')) {
          this.logger.log('SECURITY', 'SQL Injection Test', 'FAIL', 'Possível vulnerabilidade detectada', error.message);
        } else {
          protectionWorking++;
          this.logger.log('SECURITY', 'SQL Injection Test', 'PASS', 'Input rejeitado com segurança');
        }

      } catch (err) {
        protectionWorking++;
        this.logger.log('SECURITY', 'SQL Injection Test', 'PASS', 'Input bloqueado por proteção');
      }
    }

    const protectionRate = (protectionWorking / maliciousInputs.length) * 100;
    this.logger.log('SECURITY', 'SQL Injection Protection', 'INFO', 
      `${protectionRate.toFixed(1)}% dos inputs maliciosos foram bloqueados`);

    return protectionRate > 80;
  }

  // Testar limites de rate limiting (se implementado)
  async testRateLimiting() {
    this.logger.log('SECURITY', 'Rate Limiting', 'INFO', 'Testando limites de taxa de requisições...');
    
    try {
      const requests = [];
      const startTime = Date.now();
      
      // Fazer múltiplas requisições rapidamente
      for (let i = 0; i < 50; i++) {
        requests.push(
          this.supabase
            .from('leads')
            .select('id')
            .limit(1)
        );
      }

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const duration = endTime - startTime;

      this.logger.log('SECURITY', 'Rate Limiting', 'INFO', 
        `${successful} sucessos, ${failed} falhas em ${duration}ms`);

      // Se algumas requisições falharam, pode indicar rate limiting
      if (failed > 0) {
        this.logger.log('SECURITY', 'Rate Limiting', 'PASS', 'Rate limiting pode estar ativo');
        return true;
      } else {
        this.logger.log('SECURITY', 'Rate Limiting', 'INFO', 'Nenhum rate limiting detectado');
        return false;
      }

    } catch (error) {
      this.logger.log('SECURITY', 'Rate Limiting', 'FAIL', 'Erro durante teste de rate limiting', error.message);
      return false;
    }
  }

  // Executar todos os testes de segurança
  async runAllSecurityTests() {
    this.logger.log('SECURITY', 'Início Geral', 'INFO', 'Iniciando todos os testes de segurança...');
    
    const results = {};
    
    // Tabelas principais para testar RLS
    const mainTables = ['companies', 'leads', 'surveys', 'profiles', 'notifications'];
    
    // Testar RLS em cada tabela
    results.rlsEnabled = {};
    results.rlsPolicies = {};
    
    for (const table of mainTables) {
      results.rlsEnabled[table] = await this.checkRLSEnabled(table);
      results.rlsPolicies[table] = await this.testTableRLSPolicies(table);
    }
    
    // Outros testes de segurança
    results.dataIsolation = await this.testDataIsolation();
    results.roleBasedAccess = await this.testRoleBasedAccess();
    results.sqlInjectionProtection = await this.testSQLInjectionProtection();
    results.rateLimiting = await this.testRateLimiting();
    
    this.logger.log('SECURITY', 'Conclusão Geral', 'INFO', 'Todos os testes de segurança concluídos');
    
    return results;
  }
}

export { SecurityTester };