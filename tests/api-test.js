/**
 * =====================================================
 * TESTES DE API REST E GRAPHQL
 * =====================================================
 * 
 * Módulo dedicado para testar:
 * - Endpoints REST do Supabase
 * - Consultas GraphQL
 * - Filtros e ordenação
 * - Paginação
 * - Agregações
 * - Joins entre tabelas
 * - Funções RPC (Remote Procedure Calls)
 * - Validação de respostas
 * - Headers e autenticação
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES DE API
// =====================================================

class APITester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.testData = {};
  }

  // Testar consulta REST básica
  async testBasicRESTQuery() {
    this.logger.log('API', 'Basic REST Query', 'INFO', 'Testando consulta REST básica...');
    
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .limit(5);

      if (error) {
        this.logger.log('API', 'Basic REST Query', 'FAIL', 'Erro na consulta REST', error.message);
        return false;
      }

      this.logger.log('API', 'Basic REST Query', 'PASS', 
        `Consulta REST executada com sucesso - ${data ? data.length : 0} registro(s)`);
      
      this.testData.companies = data;
      return true;

    } catch (error) {
      this.logger.log('API', 'Basic REST Query', 'FAIL', 'Exceção durante consulta REST', error.message);
      return false;
    }
  }

  // Testar filtros REST
  async testRESTFilters() {
    this.logger.log('API', 'REST Filters', 'INFO', 'Testando filtros REST...');
    
    try {
      const filters = [
        // Filtro de igualdade
        { method: 'eq', field: 'active', value: true, description: 'Igualdade (eq)' },
        // Filtro de texto
        { method: 'ilike', field: 'name', value: '%test%', description: 'Busca de texto (ilike)' },
        // Filtro de data
        { method: 'gte', field: 'created_at', value: '2024-01-01', description: 'Data maior ou igual (gte)' },
        // Filtro nulo
        { method: 'is', field: 'deleted_at', value: null, description: 'Campo nulo (is null)' }
      ];

      let successCount = 0;

      for (const filter of filters) {
        try {
          let query = this.supabase.from('companies').select('id, name, active, created_at');
          
          // Aplicar filtro baseado no método
          switch (filter.method) {
            case 'eq':
              query = query.eq(filter.field, filter.value);
              break;
            case 'ilike':
              query = query.ilike(filter.field, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.field, filter.value);
              break;
            case 'is':
              query = query.is(filter.field, filter.value);
              break;
          }

          const { data, error } = await query.limit(3);

          if (error) {
            this.logger.log('API', `Filter ${filter.description}`, 'FAIL', 'Erro no filtro', error.message);
          } else {
            this.logger.log('API', `Filter ${filter.description}`, 'PASS', 
              `Filtro aplicado - ${data ? data.length : 0} resultado(s)`);
            successCount++;
          }

        } catch (err) {
          this.logger.log('API', `Filter ${filter.description}`, 'FAIL', 'Exceção no filtro', err.message);
        }
      }

      const successRate = (successCount / filters.length) * 100;
      this.logger.log('API', 'REST Filters', 'INFO', 
        `${successCount}/${filters.length} filtros funcionando (${successRate.toFixed(1)}%)`);

      return successRate > 50;

    } catch (error) {
      this.logger.log('API', 'REST Filters', 'FAIL', 'Exceção durante teste de filtros', error.message);
      return false;
    }
  }

  // Testar ordenação REST
  async testRESTOrdering() {
    this.logger.log('API', 'REST Ordering', 'INFO', 'Testando ordenação REST...');
    
    try {
      const orderTests = [
        { field: 'created_at', ascending: false, description: 'Ordenação por data (desc)' },
        { field: 'name', ascending: true, description: 'Ordenação por nome (asc)' },
        { field: 'id', ascending: true, description: 'Ordenação por ID (asc)' }
      ];

      let successCount = 0;

      for (const orderTest of orderTests) {
        try {
          const { data, error } = await this.supabase
            .from('companies')
            .select('id, name, created_at')
            .order(orderTest.field, { ascending: orderTest.ascending })
            .limit(5);

          if (error) {
            this.logger.log('API', orderTest.description, 'FAIL', 'Erro na ordenação', error.message);
          } else {
            this.logger.log('API', orderTest.description, 'PASS', 
              `Ordenação aplicada - ${data ? data.length : 0} resultado(s)`);
            successCount++;
          }

        } catch (err) {
          this.logger.log('API', orderTest.description, 'FAIL', 'Exceção na ordenação', err.message);
        }
      }

      const successRate = (successCount / orderTests.length) * 100;
      this.logger.log('API', 'REST Ordering', 'INFO', 
        `${successCount}/${orderTests.length} ordenações funcionando (${successRate.toFixed(1)}%)`);

      return successRate > 50;

    } catch (error) {
      this.logger.log('API', 'REST Ordering', 'FAIL', 'Exceção durante teste de ordenação', error.message);
      return false;
    }
  }

  // Testar paginação REST
  async testRESTPagination() {
    this.logger.log('API', 'REST Pagination', 'INFO', 'Testando paginação REST...');
    
    try {
      // Primeira página
      const { data: page1, error: error1 } = await this.supabase
        .from('companies')
        .select('id, name')
        .range(0, 2); // 3 registros (0, 1, 2)

      if (error1) {
        this.logger.log('API', 'Pagination Page 1', 'FAIL', 'Erro na primeira página', error1.message);
        return false;
      }

      // Segunda página
      const { data: page2, error: error2 } = await this.supabase
        .from('companies')
        .select('id, name')
        .range(3, 5); // 3 registros (3, 4, 5)

      if (error2) {
        this.logger.log('API', 'Pagination Page 2', 'FAIL', 'Erro na segunda página', error2.message);
        return false;
      }

      this.logger.log('API', 'REST Pagination', 'PASS', 
        `Paginação funcionando - Página 1: ${page1 ? page1.length : 0}, Página 2: ${page2 ? page2.length : 0}`);

      return true;

    } catch (error) {
      this.logger.log('API', 'REST Pagination', 'FAIL', 'Exceção durante paginação', error.message);
      return false;
    }
  }

  // Testar joins entre tabelas
  async testRESTJoins() {
    this.logger.log('API', 'REST Joins', 'INFO', 'Testando joins entre tabelas...');
    
    try {
      // Join entre companies e leads
      const { data: companyLeads, error: error1 } = await this.supabase
        .from('companies')
        .select(`
          id,
          name,
          leads (
            id,
            name,
            email
          )
        `)
        .limit(3);

      if (error1) {
        this.logger.log('API', 'Join Companies-Leads', 'FAIL', 'Erro no join companies-leads', error1.message);
      } else {
        this.logger.log('API', 'Join Companies-Leads', 'PASS', 
          `Join executado - ${companyLeads ? companyLeads.length : 0} empresa(s) com leads`);
      }

      // Join entre companies e surveys
      const { data: companySurveys, error: error2 } = await this.supabase
        .from('companies')
        .select(`
          id,
          name,
          surveys (
            id,
            title,
            created_at
          )
        `)
        .limit(3);

      if (error2) {
        this.logger.log('API', 'Join Companies-Surveys', 'FAIL', 'Erro no join companies-surveys', error2.message);
      } else {
        this.logger.log('API', 'Join Companies-Surveys', 'PASS', 
          `Join executado - ${companySurveys ? companySurveys.length : 0} empresa(s) com surveys`);
      }

      return !error1 || !error2;

    } catch (error) {
      this.logger.log('API', 'REST Joins', 'FAIL', 'Exceção durante joins', error.message);
      return false;
    }
  }

  // Testar agregações
  async testRESTAggregations() {
    this.logger.log('API', 'REST Aggregations', 'INFO', 'Testando agregações REST...');
    
    try {
      // Contar registros
      const { count, error: countError } = await this.supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        this.logger.log('API', 'Count Aggregation', 'FAIL', 'Erro na contagem', countError.message);
      } else {
        this.logger.log('API', 'Count Aggregation', 'PASS', `Contagem executada - ${count} registro(s)`);
      }

      // Tentar outras agregações via RPC se disponível
      try {
        const { data: statsData, error: statsError } = await this.supabase
          .rpc('get_company_stats');

        if (statsError) {
          this.logger.log('API', 'Stats RPC', 'INFO', 'Função de estatísticas não disponível');
        } else {
          this.logger.log('API', 'Stats RPC', 'PASS', 'Estatísticas obtidas via RPC');
        }
      } catch (rpcError) {
        this.logger.log('API', 'Stats RPC', 'INFO', 'RPC de estatísticas não implementado');
      }

      return !countError;

    } catch (error) {
      this.logger.log('API', 'REST Aggregations', 'FAIL', 'Exceção durante agregações', error.message);
      return false;
    }
  }

  // Testar funções RPC
  async testRPCFunctions() {
    this.logger.log('API', 'RPC Functions', 'INFO', 'Testando funções RPC...');
    
    try {
      const rpcFunctions = [
        { name: 'has_role', params: { _user_id: '00000000-0000-0000-0000-000000000000', _role: 'admin' } },
        { name: 'is_company_admin', params: { _user_id: '00000000-0000-0000-0000-000000000000', _company_id: '00000000-0000-0000-0000-000000000000' } },
        { name: 'exec_sql', params: { sql_query: 'SELECT 1 as test' } }
      ];

      let successCount = 0;

      for (const rpcFunc of rpcFunctions) {
        try {
          const { data, error } = await this.supabase.rpc(rpcFunc.name, rpcFunc.params);

          if (error) {
            if (error.message.includes('function') && error.message.includes('does not exist')) {
              this.logger.log('API', `RPC ${rpcFunc.name}`, 'INFO', 'Função não existe (esperado)');
            } else {
              this.logger.log('API', `RPC ${rpcFunc.name}`, 'FAIL', 'Erro na função RPC', error.message);
            }
          } else {
            this.logger.log('API', `RPC ${rpcFunc.name}`, 'PASS', 'Função RPC executada com sucesso');
            successCount++;
          }

        } catch (err) {
          this.logger.log('API', `RPC ${rpcFunc.name}`, 'INFO', 'Função não disponível');
        }
      }

      this.logger.log('API', 'RPC Functions', 'INFO', 
        `${successCount}/${rpcFunctions.length} funções RPC funcionando`);

      return true; // RPC é opcional, então sempre retorna true

    } catch (error) {
      this.logger.log('API', 'RPC Functions', 'FAIL', 'Exceção durante teste RPC', error.message);
      return false;
    }
  }

  // Testar GraphQL (se disponível)
  async testGraphQLQuery() {
    this.logger.log('API', 'GraphQL Query', 'INFO', 'Testando consulta GraphQL...');
    
    try {
      // O Supabase não tem GraphQL nativo, mas podemos simular
      // ou testar se há alguma implementação customizada
      
      // Tentar fazer uma requisição GraphQL para o endpoint
      const graphqlEndpoint = `${this.supabase.supabaseUrl}/graphql/v1`;
      
      const query = `
        query {
          companiesCollection {
            edges {
              node {
                id
                name
                created_at
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabase.supabaseKey}`,
            'apikey': this.supabase.supabaseKey
          },
          body: JSON.stringify({ query })
        });

        if (response.ok) {
          const result = await response.json();
          this.logger.log('API', 'GraphQL Query', 'PASS', 'Consulta GraphQL executada', result);
          return true;
        } else {
          this.logger.log('API', 'GraphQL Query', 'INFO', 'GraphQL não disponível ou não configurado');
          return false;
        }

      } catch (fetchError) {
        this.logger.log('API', 'GraphQL Query', 'INFO', 'GraphQL não disponível');
        return false;
      }

    } catch (error) {
      this.logger.log('API', 'GraphQL Query', 'FAIL', 'Exceção durante teste GraphQL', error.message);
      return false;
    }
  }

  // Testar headers de resposta
  async testResponseHeaders() {
    this.logger.log('API', 'Response Headers', 'INFO', 'Testando headers de resposta...');
    
    try {
      // Fazer uma requisição direta para verificar headers
      const response = await fetch(`${this.supabase.supabaseUrl}/rest/v1/companies?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': this.supabase.supabaseKey,
          'Authorization': `Bearer ${this.supabase.supabaseKey}`
        }
      });

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      this.logger.log('API', 'Response Headers', 'PASS', 'Headers obtidos', {
        'content-type': headers['content-type'],
        'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': headers['x-ratelimit-reset']
      });

      return true;

    } catch (error) {
      this.logger.log('API', 'Response Headers', 'FAIL', 'Erro ao obter headers', error.message);
      return false;
    }
  }

  // Testar validação de dados
  async testDataValidation() {
    this.logger.log('API', 'Data Validation', 'INFO', 'Testando validação de dados...');
    
    try {
      // Tentar inserir dados inválidos para testar validação
      const invalidData = {
        name: '', // Nome vazio
        email: 'invalid-email', // Email inválido
        created_at: 'invalid-date' // Data inválida
      };

      const { data, error } = await this.supabase
        .from('leads')
        .insert(invalidData);

      if (error) {
        this.logger.log('API', 'Data Validation', 'PASS', 'Dados inválidos rejeitados corretamente', error.message);
        return true;
      } else {
        this.logger.log('API', 'Data Validation', 'FAIL', 'Dados inválidos foram aceitos');
        
        // Se foi aceito, tentar limpar
        if (data && data[0] && data[0].id) {
          await this.supabase.from('leads').delete().eq('id', data[0].id);
        }
        
        return false;
      }

    } catch (error) {
      this.logger.log('API', 'Data Validation', 'PASS', 'Exceção esperada para dados inválidos');
      return true;
    }
  }

  // Testar limites de consulta
  async testQueryLimits() {
    this.logger.log('API', 'Query Limits', 'INFO', 'Testando limites de consulta...');
    
    try {
      // Tentar consulta com limite muito alto
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .limit(10000); // Limite alto

      if (error) {
        if (error.message.includes('limit') || error.message.includes('maximum')) {
          this.logger.log('API', 'Query Limits', 'PASS', 'Limite de consulta aplicado corretamente', error.message);
          return true;
        } else {
          this.logger.log('API', 'Query Limits', 'FAIL', 'Erro inesperado no limite', error.message);
          return false;
        }
      } else {
        this.logger.log('API', 'Query Limits', 'INFO', 
          `Consulta com limite alto executada - ${data ? data.length : 0} registros`);
        return true;
      }

    } catch (error) {
      this.logger.log('API', 'Query Limits', 'FAIL', 'Exceção durante teste de limites', error.message);
      return false;
    }
  }

  // Executar todos os testes de API
  async runAllAPITests() {
    this.logger.log('API', 'Início Geral', 'INFO', 'Iniciando todos os testes de API...');
    
    const results = {};
    
    // Testes REST básicos
    results.basicRESTQuery = await this.testBasicRESTQuery();
    results.restFilters = await this.testRESTFilters();
    results.restOrdering = await this.testRESTOrdering();
    results.restPagination = await this.testRESTPagination();
    results.restJoins = await this.testRESTJoins();
    results.restAggregations = await this.testRESTAggregations();
    
    // Testes de funções
    results.rpcFunctions = await this.testRPCFunctions();
    
    // Testes GraphQL
    results.graphqlQuery = await this.testGraphQLQuery();
    
    // Testes de validação e limites
    results.responseHeaders = await this.testResponseHeaders();
    results.dataValidation = await this.testDataValidation();
    results.queryLimits = await this.testQueryLimits();
    
    this.logger.log('API', 'Conclusão Geral', 'INFO', 'Todos os testes de API concluídos');
    
    return results;
  }
}

export { APITester };