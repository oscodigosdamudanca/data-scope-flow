/**
 * =====================================================
 * TESTES CRUD - OPERAÇÕES DE BANCO DE DADOS
 * =====================================================
 * 
 * Módulo dedicado para testar operações CRUD em todas as tabelas:
 * - Companies (Empresas)
 * - Leads (Prospects)
 * - Surveys (Pesquisas)
 * - Survey Questions (Perguntas)
 * - Survey Responses (Respostas)
 * - Profiles (Perfis)
 * - Notifications (Notificações)
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger, testData } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES CRUD
// =====================================================

class CRUDTester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.createdRecords = {}; // Para limpeza posterior
  }

  // Método genérico para testar CRUD em uma tabela
  async testTableCRUD(tableName, testRecord, updateData = {}) {
    this.logger.log('CRUD', `${tableName} - Início`, 'INFO', `Iniciando testes CRUD para ${tableName}`);
    
    let results = {
      create: false,
      read: false,
      update: false,
      delete: false,
      recordId: null
    };

    try {
      // 1. CREATE - Inserir registro
      this.logger.log('CRUD', `${tableName} - Create`, 'INFO', 'Testando inserção...');
      
      const { data: createData, error: createError } = await this.supabase
        .from(tableName)
        .insert(testRecord)
        .select()
        .single();

      if (createError) {
        this.logger.log('CRUD', `${tableName} - Create`, 'FAIL', 'Falha na inserção', createError.message);
      } else {
        results.create = true;
        results.recordId = createData.id;
        this.createdRecords[tableName] = createData.id;
        this.logger.log('CRUD', `${tableName} - Create`, 'PASS', 'Inserção realizada com sucesso');
      }

      // 2. READ - Ler registro
      if (results.recordId) {
        this.logger.log('CRUD', `${tableName} - Read`, 'INFO', 'Testando leitura...');
        
        const { data: readData, error: readError } = await this.supabase
          .from(tableName)
          .select('*')
          .eq('id', results.recordId)
          .single();

        if (readError) {
          this.logger.log('CRUD', `${tableName} - Read`, 'FAIL', 'Falha na leitura', readError.message);
        } else {
          results.read = true;
          this.logger.log('CRUD', `${tableName} - Read`, 'PASS', 'Leitura realizada com sucesso');
        }

        // 3. UPDATE - Atualizar registro
        if (Object.keys(updateData).length > 0) {
          this.logger.log('CRUD', `${tableName} - Update`, 'INFO', 'Testando atualização...');
          
          const { data: updateDataResult, error: updateError } = await this.supabase
            .from(tableName)
            .update(updateData)
            .eq('id', results.recordId)
            .select()
            .single();

          if (updateError) {
            this.logger.log('CRUD', `${tableName} - Update`, 'FAIL', 'Falha na atualização', updateError.message);
          } else {
            results.update = true;
            this.logger.log('CRUD', `${tableName} - Update`, 'PASS', 'Atualização realizada com sucesso');
          }
        } else {
          this.logger.log('CRUD', `${tableName} - Update`, 'SKIP', 'Dados de atualização não fornecidos');
        }

        // 4. DELETE - Deletar registro
        this.logger.log('CRUD', `${tableName} - Delete`, 'INFO', 'Testando exclusão...');
        
        const { error: deleteError } = await this.supabase
          .from(tableName)
          .delete()
          .eq('id', results.recordId);

        if (deleteError) {
          this.logger.log('CRUD', `${tableName} - Delete`, 'FAIL', 'Falha na exclusão', deleteError.message);
        } else {
          results.delete = true;
          delete this.createdRecords[tableName];
          this.logger.log('CRUD', `${tableName} - Delete`, 'PASS', 'Exclusão realizada com sucesso');
        }
      }

    } catch (error) {
      this.logger.log('CRUD', `${tableName} - Erro`, 'FAIL', 'Erro durante teste CRUD', error.message);
    }

    const passedOperations = Object.values(results).filter(v => v === true).length;
    const totalOperations = Object.keys(results).filter(k => k !== 'recordId').length;
    
    this.logger.log('CRUD', `${tableName} - Resumo`, 'INFO', 
      `${passedOperations}/${totalOperations} operações CRUD aprovadas`);

    return results;
  }

  // Teste específico para tabela Companies
  async testCompanies() {
    const testCompany = {
      ...testData.testCompany,
      created_by: '00000000-0000-0000-0000-000000000000' // UUID fictício para teste
    };

    const updateData = {
      name: 'Empresa Teste DataScope - Atualizada',
      phone: '(11) 88888-8888'
    };

    return await this.testTableCRUD('companies', testCompany, updateData);
  }

  // Teste específico para tabela Leads
  async testLeads() {
    const testLead = {
      ...testData.testLead,
      status: 'new',
      priority: 'medium',
      lead_score: 75,
      lgpd_consent: true
    };

    const updateData = {
      status: 'contacted',
      priority: 'high',
      lead_score: 85,
      notes: 'Lead atualizado durante teste'
    };

    return await this.testTableCRUD('leads', testLead, updateData);
  }

  // Teste específico para tabela Surveys
  async testSurveys() {
    const testSurvey = {
      ...testData.testSurvey,
      status: 'draft',
      anonymous_responses: true,
      created_by: '00000000-0000-0000-0000-000000000000'
    };

    const updateData = {
      status: 'active',
      description: 'Pesquisa atualizada durante teste'
    };

    return await this.testTableCRUD('surveys', testSurvey, updateData);
  }

  // Teste específico para tabela Profiles
  async testProfiles() {
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000001', // UUID fictício
      display_name: 'Perfil de Teste',
      phone: '(11) 99999-9999'
    };

    const updateData = {
      display_name: 'Perfil de Teste - Atualizado',
      phone: '(11) 88888-8888'
    };

    return await this.testTableCRUD('profiles', testProfile, updateData);
  }

  // Teste de operações em lote (Batch Operations)
  async testBatchOperations() {
    this.logger.log('CRUD', 'Batch Operations', 'INFO', 'Testando operações em lote...');
    
    try {
      // Inserção em lote de leads
      const batchLeads = [
        {
          name: 'Lead Batch 1',
          email: 'lead1@batch.com',
          phone: '(11) 11111-1111',
          company: 'Empresa Batch 1'
        },
        {
          name: 'Lead Batch 2', 
          email: 'lead2@batch.com',
          phone: '(11) 22222-2222',
          company: 'Empresa Batch 2'
        },
        {
          name: 'Lead Batch 3',
          email: 'lead3@batch.com', 
          phone: '(11) 33333-3333',
          company: 'Empresa Batch 3'
        }
      ];

      const { data: batchData, error: batchError } = await this.supabase
        .from('leads')
        .insert(batchLeads)
        .select();

      if (batchError) {
        this.logger.log('CRUD', 'Batch Insert', 'FAIL', 'Falha na inserção em lote', batchError.message);
        return false;
      }

      this.logger.log('CRUD', 'Batch Insert', 'PASS', `${batchData.length} registros inseridos em lote`);

      // Limpeza dos registros criados
      const batchIds = batchData.map(record => record.id);
      const { error: cleanupError } = await this.supabase
        .from('leads')
        .delete()
        .in('id', batchIds);

      if (cleanupError) {
        this.logger.log('CRUD', 'Batch Cleanup', 'FAIL', 'Falha na limpeza dos registros', cleanupError.message);
      } else {
        this.logger.log('CRUD', 'Batch Cleanup', 'PASS', 'Limpeza dos registros realizada');
      }

      return true;

    } catch (error) {
      this.logger.log('CRUD', 'Batch Operations', 'FAIL', 'Erro durante operações em lote', error.message);
      return false;
    }
  }

  // Teste de consultas complexas
  async testComplexQueries() {
    this.logger.log('CRUD', 'Complex Queries', 'INFO', 'Testando consultas complexas...');
    
    try {
      // 1. Consulta com filtros múltiplos
      const { data: filteredData, error: filterError } = await this.supabase
        .from('leads')
        .select('*')
        .eq('status', 'new')
        .gte('lead_score', 50)
        .limit(10);

      if (filterError) {
        this.logger.log('CRUD', 'Filtered Query', 'FAIL', 'Falha na consulta filtrada', filterError.message);
      } else {
        this.logger.log('CRUD', 'Filtered Query', 'PASS', `Consulta filtrada retornou ${filteredData.length} registros`);
      }

      // 2. Consulta com ordenação
      const { data: sortedData, error: sortError } = await this.supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (sortError) {
        this.logger.log('CRUD', 'Sorted Query', 'FAIL', 'Falha na consulta ordenada', sortError.message);
      } else {
        this.logger.log('CRUD', 'Sorted Query', 'PASS', `Consulta ordenada retornou ${sortedData.length} registros`);
      }

      // 3. Consulta com contagem
      const { count, error: countError } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        this.logger.log('CRUD', 'Count Query', 'FAIL', 'Falha na consulta de contagem', countError.message);
      } else {
        this.logger.log('CRUD', 'Count Query', 'PASS', `Total de leads no banco: ${count}`);
      }

      return true;

    } catch (error) {
      this.logger.log('CRUD', 'Complex Queries', 'FAIL', 'Erro durante consultas complexas', error.message);
      return false;
    }
  }

  // Limpeza de registros criados durante os testes
  async cleanup() {
    this.logger.log('CRUD', 'Cleanup', 'INFO', 'Limpando registros de teste...');
    
    for (const [tableName, recordId] of Object.entries(this.createdRecords)) {
      try {
        await this.supabase
          .from(tableName)
          .delete()
          .eq('id', recordId);
        
        this.logger.log('CRUD', 'Cleanup', 'PASS', `Registro removido de ${tableName}`);
      } catch (error) {
        this.logger.log('CRUD', 'Cleanup', 'FAIL', `Falha ao remover de ${tableName}`, error.message);
      }
    }
  }

  // Executar todos os testes CRUD
  async runAllCRUDTests() {
    this.logger.log('CRUD', 'Início Geral', 'INFO', 'Iniciando todos os testes CRUD...');
    
    const results = {};
    
    // Testes individuais por tabela
    results.companies = await this.testCompanies();
    results.leads = await this.testLeads();
    results.surveys = await this.testSurveys();
    results.profiles = await this.testProfiles();
    
    // Testes de operações especiais
    results.batchOperations = await this.testBatchOperations();
    results.complexQueries = await this.testComplexQueries();
    
    // Limpeza final
    await this.cleanup();
    
    this.logger.log('CRUD', 'Conclusão Geral', 'INFO', 'Todos os testes CRUD concluídos');
    
    return results;
  }
}

export { CRUDTester };