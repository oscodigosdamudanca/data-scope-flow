/**
 * =====================================================
 * TESTES DE PERFORMANCE E BENCHMARKING
 * =====================================================
 * 
 * Módulo dedicado para testar:
 * - Tempo de resposta de consultas
 * - Throughput de operações
 * - Concorrência de requisições
 * - Performance de joins complexos
 * - Tempo de conexão
 * - Latência de rede
 * - Uso de memória
 * - Stress testing
 * - Benchmarks comparativos
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES DE PERFORMANCE
// =====================================================

class PerformanceTester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.benchmarks = {};
  }

  // Utilitário para medir tempo de execução
  async measureExecutionTime(testName, asyncFunction) {
    const startTime = performance.now();
    const result = await asyncFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      result,
      duration: Math.round(duration * 100) / 100, // Arredondar para 2 casas decimais
      timestamp: new Date().toISOString()
    };
  }

  // Testar tempo de conexão inicial
  async testConnectionTime() {
    this.logger.log('PERFORMANCE', 'Connection Time', 'INFO', 'Testando tempo de conexão inicial...');
    
    try {
      const measurement = await this.measureExecutionTime('connection', async () => {
        // Fazer uma consulta simples para testar conexão
        const { data, error } = await this.supabase
          .from('companies')
          .select('id')
          .limit(1);
        
        return { data, error };
      });

      if (measurement.result.error) {
        this.logger.log('PERFORMANCE', 'Connection Time', 'FAIL', 'Erro na conexão', measurement.result.error.message);
        return false;
      }

      this.benchmarks.connectionTime = measurement.duration;
      
      let status = 'PASS';
      let message = `Conexão estabelecida em ${measurement.duration}ms`;
      
      if (measurement.duration > 5000) {
        status = 'FAIL';
        message += ' (muito lento)';
      } else if (measurement.duration > 2000) {
        status = 'WARN';
        message += ' (lento)';
      }

      this.logger.log('PERFORMANCE', 'Connection Time', status, message);
      return measurement.duration < 5000;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Connection Time', 'FAIL', 'Exceção durante teste de conexão', error.message);
      return false;
    }
  }

  // Testar performance de consultas simples
  async testSimpleQueryPerformance() {
    this.logger.log('PERFORMANCE', 'Simple Query Performance', 'INFO', 'Testando performance de consultas simples...');
    
    try {
      const queries = [
        { name: 'Select All Companies', query: () => this.supabase.from('companies').select('*').limit(10) },
        { name: 'Select All Leads', query: () => this.supabase.from('leads').select('*').limit(10) },
        { name: 'Select All Surveys', query: () => this.supabase.from('surveys').select('*').limit(10) },
        { name: 'Count Companies', query: () => this.supabase.from('companies').select('*', { count: 'exact', head: true }) }
      ];

      const results = [];

      for (const queryTest of queries) {
        try {
          const measurement = await this.measureExecutionTime(queryTest.name, async () => {
            const { data, error } = await queryTest.query();
            return { data, error };
          });

          if (measurement.result.error) {
            this.logger.log('PERFORMANCE', queryTest.name, 'FAIL', 'Erro na consulta', measurement.result.error.message);
            results.push({ name: queryTest.name, duration: null, success: false });
          } else {
            let status = 'PASS';
            if (measurement.duration > 2000) status = 'WARN';
            if (measurement.duration > 5000) status = 'FAIL';

            this.logger.log('PERFORMANCE', queryTest.name, status, `${measurement.duration}ms`);
            results.push({ name: queryTest.name, duration: measurement.duration, success: true });
          }

        } catch (err) {
          this.logger.log('PERFORMANCE', queryTest.name, 'FAIL', 'Exceção na consulta', err.message);
          results.push({ name: queryTest.name, duration: null, success: false });
        }
      }

      const successfulQueries = results.filter(r => r.success);
      const averageTime = successfulQueries.length > 0 
        ? successfulQueries.reduce((sum, r) => sum + r.duration, 0) / successfulQueries.length 
        : 0;

      this.benchmarks.simpleQueryAverage = Math.round(averageTime * 100) / 100;
      
      this.logger.log('PERFORMANCE', 'Simple Query Performance', 'INFO', 
        `Tempo médio: ${this.benchmarks.simpleQueryAverage}ms (${successfulQueries.length}/${queries.length} consultas)`);

      return successfulQueries.length > 0;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Simple Query Performance', 'FAIL', 'Exceção durante teste', error.message);
      return false;
    }
  }

  // Testar performance de joins complexos
  async testComplexJoinPerformance() {
    this.logger.log('PERFORMANCE', 'Complex Join Performance', 'INFO', 'Testando performance de joins complexos...');
    
    try {
      const complexQueries = [
        {
          name: 'Company with Leads',
          query: () => this.supabase
            .from('companies')
            .select(`
              id,
              name,
              leads (
                id,
                name,
                email,
                created_at
              )
            `)
            .limit(5)
        },
        {
          name: 'Company with Surveys',
          query: () => this.supabase
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
            .limit(5)
        },
        {
          name: 'Deep Join',
          query: () => this.supabase
            .from('companies')
            .select(`
              id,
              name,
              leads (
                id,
                name,
                surveys (
                  id,
                  title
                )
              )
            `)
            .limit(3)
        }
      ];

      const results = [];

      for (const queryTest of complexQueries) {
        try {
          const measurement = await this.measureExecutionTime(queryTest.name, async () => {
            const { data, error } = await queryTest.query();
            return { data, error };
          });

          if (measurement.result.error) {
            this.logger.log('PERFORMANCE', queryTest.name, 'FAIL', 'Erro no join', measurement.result.error.message);
            results.push({ name: queryTest.name, duration: null, success: false });
          } else {
            let status = 'PASS';
            if (measurement.duration > 3000) status = 'WARN';
            if (measurement.duration > 8000) status = 'FAIL';

            this.logger.log('PERFORMANCE', queryTest.name, status, `${measurement.duration}ms`);
            results.push({ name: queryTest.name, duration: measurement.duration, success: true });
          }

        } catch (err) {
          this.logger.log('PERFORMANCE', queryTest.name, 'FAIL', 'Exceção no join', err.message);
          results.push({ name: queryTest.name, duration: null, success: false });
        }
      }

      const successfulJoins = results.filter(r => r.success);
      const averageTime = successfulJoins.length > 0 
        ? successfulJoins.reduce((sum, r) => sum + r.duration, 0) / successfulJoins.length 
        : 0;

      this.benchmarks.complexJoinAverage = Math.round(averageTime * 100) / 100;
      
      this.logger.log('PERFORMANCE', 'Complex Join Performance', 'INFO', 
        `Tempo médio de joins: ${this.benchmarks.complexJoinAverage}ms`);

      return successfulJoins.length > 0;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Complex Join Performance', 'FAIL', 'Exceção durante teste de joins', error.message);
      return false;
    }
  }

  // Testar concorrência de requisições
  async testConcurrentRequests() {
    this.logger.log('PERFORMANCE', 'Concurrent Requests', 'INFO', 'Testando concorrência de requisições...');
    
    try {
      const concurrencyLevels = [5, 10, 20];
      const results = {};

      for (const concurrency of concurrencyLevels) {
        this.logger.log('PERFORMANCE', `Concurrency ${concurrency}`, 'INFO', `Testando ${concurrency} requisições simultâneas...`);
        
        const measurement = await this.measureExecutionTime(`concurrent-${concurrency}`, async () => {
          const promises = [];
          
          for (let i = 0; i < concurrency; i++) {
            promises.push(
              this.supabase
                .from('companies')
                .select('id, name')
                .limit(1)
            );
          }

          const results = await Promise.allSettled(promises);
          const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
          const failed = results.length - successful;

          return { successful, failed, total: results.length };
        });

        const successRate = (measurement.result.successful / measurement.result.total) * 100;
        const avgTimePerRequest = measurement.duration / concurrency;

        results[concurrency] = {
          totalTime: measurement.duration,
          avgTimePerRequest: Math.round(avgTimePerRequest * 100) / 100,
          successRate: Math.round(successRate * 100) / 100,
          successful: measurement.result.successful,
          failed: measurement.result.failed
        };

        let status = 'PASS';
        if (successRate < 80) status = 'FAIL';
        else if (successRate < 95) status = 'WARN';

        this.logger.log('PERFORMANCE', `Concurrency ${concurrency}`, status, 
          `${measurement.result.successful}/${measurement.result.total} sucessos (${successRate.toFixed(1)}%) em ${measurement.duration}ms`);
      }

      this.benchmarks.concurrency = results;
      return true;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Concurrent Requests', 'FAIL', 'Exceção durante teste de concorrência', error.message);
      return false;
    }
  }

  // Testar throughput de operações
  async testThroughput() {
    this.logger.log('PERFORMANCE', 'Throughput Test', 'INFO', 'Testando throughput de operações...');
    
    try {
      const duration = 10000; // 10 segundos
      const startTime = Date.now();
      let operationCount = 0;
      let errorCount = 0;

      this.logger.log('PERFORMANCE', 'Throughput Test', 'INFO', `Executando operações por ${duration/1000} segundos...`);

      while (Date.now() - startTime < duration) {
        try {
          const { data, error } = await this.supabase
            .from('companies')
            .select('id')
            .limit(1);

          if (error) {
            errorCount++;
          } else {
            operationCount++;
          }

        } catch (err) {
          errorCount++;
        }
      }

      const actualDuration = Date.now() - startTime;
      const operationsPerSecond = Math.round((operationCount / actualDuration) * 1000 * 100) / 100;
      const errorRate = Math.round((errorCount / (operationCount + errorCount)) * 100 * 100) / 100;

      this.benchmarks.throughput = {
        operationsPerSecond,
        totalOperations: operationCount,
        totalErrors: errorCount,
        errorRate,
        duration: actualDuration
      };

      let status = 'PASS';
      if (operationsPerSecond < 1) status = 'FAIL';
      else if (operationsPerSecond < 5) status = 'WARN';

      this.logger.log('PERFORMANCE', 'Throughput Test', status, 
        `${operationsPerSecond} ops/sec (${operationCount} ops, ${errorCount} erros, ${errorRate}% erro)`);

      return operationsPerSecond > 0;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Throughput Test', 'FAIL', 'Exceção durante teste de throughput', error.message);
      return false;
    }
  }

  // Testar performance de inserção em lote
  async testBatchInsertPerformance() {
    this.logger.log('PERFORMANCE', 'Batch Insert Performance', 'INFO', 'Testando performance de inserção em lote...');
    
    try {
      const batchSizes = [1, 5, 10, 20];
      const results = {};

      for (const batchSize of batchSizes) {
        // Criar dados de teste
        const testData = [];
        for (let i = 0; i < batchSize; i++) {
          testData.push({
            name: `Test Company Batch ${Date.now()}-${i}`,
            email: `test${Date.now()}${i}@batch.test`,
            active: true
          });
        }

        const measurement = await this.measureExecutionTime(`batch-${batchSize}`, async () => {
          const { data, error } = await this.supabase
            .from('companies')
            .insert(testData);

          // Limpar dados de teste se inserção foi bem-sucedida
          if (!error && data && data.length > 0) {
            const ids = data.map(item => item.id);
            await this.supabase
              .from('companies')
              .delete()
              .in('id', ids);
          }

          return { data, error };
        });

        if (measurement.result.error) {
          this.logger.log('PERFORMANCE', `Batch Insert ${batchSize}`, 'FAIL', 
            'Erro na inserção', measurement.result.error.message);
          results[batchSize] = { duration: null, success: false };
        } else {
          const timePerRecord = measurement.duration / batchSize;
          results[batchSize] = { 
            duration: measurement.duration, 
            timePerRecord: Math.round(timePerRecord * 100) / 100,
            success: true 
          };

          let status = 'PASS';
          if (measurement.duration > 5000) status = 'WARN';
          if (measurement.duration > 10000) status = 'FAIL';

          this.logger.log('PERFORMANCE', `Batch Insert ${batchSize}`, status, 
            `${measurement.duration}ms (${timePerRecord.toFixed(2)}ms/registro)`);
        }
      }

      this.benchmarks.batchInsert = results;
      return Object.values(results).some(r => r.success);

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Batch Insert Performance', 'FAIL', 'Exceção durante teste de inserção', error.message);
      return false;
    }
  }

  // Testar latência de rede
  async testNetworkLatency() {
    this.logger.log('PERFORMANCE', 'Network Latency', 'INFO', 'Testando latência de rede...');
    
    try {
      const pingCount = 5;
      const latencies = [];

      for (let i = 0; i < pingCount; i++) {
        const measurement = await this.measureExecutionTime(`ping-${i}`, async () => {
          // Fazer uma requisição mínima para medir latência
          const response = await fetch(`${this.supabase.supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'apikey': this.supabase.supabaseKey
            }
          });
          return response.ok;
        });

        if (measurement.result) {
          latencies.push(measurement.duration);
        }
      }

      if (latencies.length === 0) {
        this.logger.log('PERFORMANCE', 'Network Latency', 'FAIL', 'Não foi possível medir latência');
        return false;
      }

      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);

      this.benchmarks.networkLatency = {
        average: Math.round(avgLatency * 100) / 100,
        min: Math.round(minLatency * 100) / 100,
        max: Math.round(maxLatency * 100) / 100,
        samples: latencies.length
      };

      let status = 'PASS';
      if (avgLatency > 1000) status = 'FAIL';
      else if (avgLatency > 500) status = 'WARN';

      this.logger.log('PERFORMANCE', 'Network Latency', status, 
        `Latência média: ${avgLatency.toFixed(2)}ms (min: ${minLatency.toFixed(2)}ms, max: ${maxLatency.toFixed(2)}ms)`);

      return avgLatency < 2000;

    } catch (error) {
      this.logger.log('PERFORMANCE', 'Network Latency', 'FAIL', 'Exceção durante teste de latência', error.message);
      return false;
    }
  }

  // Gerar relatório de performance
  generatePerformanceReport() {
    this.logger.log('PERFORMANCE', 'Performance Report', 'INFO', 'Gerando relatório de performance...');
    
    const report = {
      timestamp: new Date().toISOString(),
      benchmarks: this.benchmarks,
      summary: {
        connectionTime: this.benchmarks.connectionTime || 'N/A',
        avgSimpleQuery: this.benchmarks.simpleQueryAverage || 'N/A',
        avgComplexJoin: this.benchmarks.complexJoinAverage || 'N/A',
        throughput: this.benchmarks.throughput?.operationsPerSecond || 'N/A',
        networkLatency: this.benchmarks.networkLatency?.average || 'N/A'
      },
      recommendations: []
    };

    // Gerar recomendações baseadas nos resultados
    if (this.benchmarks.connectionTime > 2000) {
      report.recommendations.push('Conexão lenta detectada - verificar configuração de rede');
    }

    if (this.benchmarks.simpleQueryAverage > 1000) {
      report.recommendations.push('Consultas simples lentas - considerar otimização de índices');
    }

    if (this.benchmarks.complexJoinAverage > 5000) {
      report.recommendations.push('Joins complexos lentos - revisar estrutura de dados e relacionamentos');
    }

    if (this.benchmarks.throughput?.operationsPerSecond < 5) {
      report.recommendations.push('Throughput baixo - verificar limites de rate limiting');
    }

    if (this.benchmarks.networkLatency?.average > 500) {
      report.recommendations.push('Alta latência de rede - considerar CDN ou servidor mais próximo');
    }

    this.logger.log('PERFORMANCE', 'Performance Report', 'INFO', 'Relatório gerado', report);
    
    return report;
  }

  // Executar todos os testes de performance
  async runAllPerformanceTests() {
    this.logger.log('PERFORMANCE', 'Início Geral', 'INFO', 'Iniciando todos os testes de performance...');
    
    const results = {};
    
    // Testes básicos de performance
    results.connectionTime = await this.testConnectionTime();
    results.simpleQueryPerformance = await this.testSimpleQueryPerformance();
    results.complexJoinPerformance = await this.testComplexJoinPerformance();
    
    // Testes de carga
    results.concurrentRequests = await this.testConcurrentRequests();
    results.throughput = await this.testThroughput();
    results.batchInsertPerformance = await this.testBatchInsertPerformance();
    
    // Testes de rede
    results.networkLatency = await this.testNetworkLatency();
    
    // Gerar relatório final
    results.performanceReport = this.generatePerformanceReport();
    
    this.logger.log('PERFORMANCE', 'Conclusão Geral', 'INFO', 'Todos os testes de performance concluídos');
    
    return results;
  }
}

export { PerformanceTester };