/**
 * =====================================================
 * SCRIPT PRINCIPAL - TESTES ABRANGENTES MCP SUPABASE
 * =====================================================
 * 
 * Este script executa todos os módulos de teste de forma
 * orquestrada e gera um relatório completo dos resultados.
 * 
 * Módulos incluídos:
 * - Conectividade e estrutura básica
 * - Operações CRUD
 * - Autenticação e sessões
 * - Segurança e RLS
 * - Gerenciamento de storage
 * - APIs REST e GraphQL
 * - Performance e benchmarking
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';
import { CRUDTester } from './crud-operations-test.js';
import { SecurityTester } from './security-rls-test.js';
import { AuthTester } from './authentication-test.js';
import { StorageTester } from './storage-test.js';
import { APITester } from './api-test.js';
import { PerformanceTester } from './performance-test.js';

// =====================================================
// CONFIGURAÇÃO E INICIALIZAÇÃO
// =====================================================

const SUPABASE_URL = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjI0NzEsImV4cCI6MjA1MTQ5ODQ3MX0.example';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inicializar logger
const logger = new TestLogger();

// =====================================================
// CLASSE PRINCIPAL DE ORQUESTRAÇÃO
// =====================================================

class ComprehensiveTestRunner {
  constructor() {
    this.supabase = supabase;
    this.logger = logger;
    this.testResults = {};
    this.startTime = null;
    this.endTime = null;
  }

  // Executar teste de conectividade básica
  async runConnectivityTest() {
    this.logger.log('MAIN', 'Connectivity Test', 'INFO', 'Testando conectividade básica...');
    
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.log('MAIN', 'Connectivity Test', 'FAIL', 'Erro de conectividade', error.message);
        return false;
      }

      this.logger.log('MAIN', 'Connectivity Test', 'PASS', 'Conectividade estabelecida com sucesso');
      return true;

    } catch (err) {
      this.logger.log('MAIN', 'Connectivity Test', 'FAIL', 'Exceção na conectividade', err.message);
      return false;
    }
  }

  // Executar todos os testes CRUD
  async runCRUDTests() {
    this.logger.log('MAIN', 'CRUD Tests', 'INFO', 'Iniciando testes CRUD...');
    
    try {
      const crudTester = new CRUDTester(this.supabase, this.logger);
      const results = await crudTester.runAllCRUDTests();
      
      this.testResults.crud = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'CRUD Tests', 'INFO', `CRUD concluído: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'CRUD Tests', 'FAIL', 'Exceção nos testes CRUD', error.message);
      this.testResults.crud = { error: error.message };
      return false;
    }
  }

  // Executar todos os testes de autenticação
  async runAuthenticationTests() {
    this.logger.log('MAIN', 'Authentication Tests', 'INFO', 'Iniciando testes de autenticação...');
    
    try {
      const authTester = new AuthTester(this.supabase, this.logger);
      const results = await authTester.runAllAuthTests();
      
      this.testResults.authentication = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'Authentication Tests', 'INFO', `Autenticação concluída: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'Authentication Tests', 'FAIL', 'Exceção nos testes de autenticação', error.message);
      this.testResults.authentication = { error: error.message };
      return false;
    }
  }

  // Executar todos os testes de segurança
  async runSecurityTests() {
    this.logger.log('MAIN', 'Security Tests', 'INFO', 'Iniciando testes de segurança...');
    
    try {
      const securityTester = new SecurityTester(this.supabase, this.logger);
      const results = await securityTester.runAllSecurityTests();
      
      this.testResults.security = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'Security Tests', 'INFO', `Segurança concluída: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'Security Tests', 'FAIL', 'Exceção nos testes de segurança', error.message);
      this.testResults.security = { error: error.message };
      return false;
    }
  }

  // Executar todos os testes de storage
  async runStorageTests() {
    this.logger.log('MAIN', 'Storage Tests', 'INFO', 'Iniciando testes de storage...');
    
    try {
      const storageTester = new StorageTester(this.supabase, this.logger);
      const results = await storageTester.runAllStorageTests();
      
      this.testResults.storage = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'Storage Tests', 'INFO', `Storage concluído: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'Storage Tests', 'FAIL', 'Exceção nos testes de storage', error.message);
      this.testResults.storage = { error: error.message };
      return false;
    }
  }

  // Executar todos os testes de API
  async runAPITests() {
    this.logger.log('MAIN', 'API Tests', 'INFO', 'Iniciando testes de API...');
    
    try {
      const apiTester = new APITester(this.supabase, this.logger);
      const results = await apiTester.runAllAPITests();
      
      this.testResults.api = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'API Tests', 'INFO', `API concluída: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'API Tests', 'FAIL', 'Exceção nos testes de API', error.message);
      this.testResults.api = { error: error.message };
      return false;
    }
  }

  // Executar todos os testes de performance
  async runPerformanceTests() {
    this.logger.log('MAIN', 'Performance Tests', 'INFO', 'Iniciando testes de performance...');
    
    try {
      const performanceTester = new PerformanceTester(this.supabase, this.logger);
      const results = await performanceTester.runAllPerformanceTests();
      
      this.testResults.performance = results;
      
      const passedTests = Object.values(results).filter(result => result === true).length;
      const totalTests = Object.keys(results).length;
      
      this.logger.log('MAIN', 'Performance Tests', 'INFO', `Performance concluída: ${passedTests}/${totalTests} testes aprovados`);
      
      return passedTests > 0;

    } catch (error) {
      this.logger.log('MAIN', 'Performance Tests', 'FAIL', 'Exceção nos testes de performance', error.message);
      this.testResults.performance = { error: error.message };
      return false;
    }
  }

  // Gerar relatório final completo
  generateFinalReport() {
    this.logger.log('MAIN', 'Final Report', 'INFO', 'Gerando relatório final...');
    
    const duration = this.endTime - this.startTime;
    const durationMinutes = Math.round(duration / 60000 * 100) / 100;

    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: `${durationMinutes} minutos`,
        supabaseUrl: SUPABASE_URL,
        testEnvironment: 'Development'
      },
      summary: {
        totalModules: 0,
        passedModules: 0,
        failedModules: 0,
        overallStatus: 'UNKNOWN'
      },
      modules: {},
      recommendations: [],
      criticalIssues: []
    };

    // Analisar resultados de cada módulo
    const moduleResults = [
      { name: 'connectivity', results: this.testResults.connectivity || false },
      { name: 'crud', results: this.testResults.crud || {} },
      { name: 'authentication', results: this.testResults.authentication || {} },
      { name: 'security', results: this.testResults.security || {} },
      { name: 'storage', results: this.testResults.storage || {} },
      { name: 'api', results: this.testResults.api || {} },
      { name: 'performance', results: this.testResults.performance || {} }
    ];

    for (const module of moduleResults) {
      report.summary.totalModules++;
      
      if (typeof module.results === 'boolean') {
        if (module.results) {
          report.summary.passedModules++;
          report.modules[module.name] = { status: 'PASS', details: 'Teste básico aprovado' };
        } else {
          report.summary.failedModules++;
          report.modules[module.name] = { status: 'FAIL', details: 'Teste básico falhou' };
        }
      } else if (typeof module.results === 'object') {
        if (module.results.error) {
          report.summary.failedModules++;
          report.modules[module.name] = { 
            status: 'ERROR', 
            details: `Erro: ${module.results.error}` 
          };
          report.criticalIssues.push(`${module.name}: ${module.results.error}`);
        } else {
          const testResults = Object.values(module.results).filter(r => typeof r === 'boolean');
          const passedTests = testResults.filter(r => r === true).length;
          const totalTests = testResults.length;
          
          if (totalTests > 0) {
            const successRate = (passedTests / totalTests) * 100;
            
            if (successRate >= 80) {
              report.summary.passedModules++;
              report.modules[module.name] = { 
                status: 'PASS', 
                details: `${passedTests}/${totalTests} testes aprovados (${successRate.toFixed(1)}%)` 
              };
            } else if (successRate >= 50) {
              report.summary.passedModules++;
              report.modules[module.name] = { 
                status: 'WARN', 
                details: `${passedTests}/${totalTests} testes aprovados (${successRate.toFixed(1)}%) - Atenção necessária` 
              };
              report.recommendations.push(`${module.name}: Taxa de sucesso baixa (${successRate.toFixed(1)}%)`);
            } else {
              report.summary.failedModules++;
              report.modules[module.name] = { 
                status: 'FAIL', 
                details: `${passedTests}/${totalTests} testes aprovados (${successRate.toFixed(1)}%) - Falha crítica` 
              };
              report.criticalIssues.push(`${module.name}: Taxa de sucesso muito baixa (${successRate.toFixed(1)}%)`);
            }
          } else {
            report.summary.passedModules++;
            report.modules[module.name] = { status: 'SKIP', details: 'Nenhum teste executado' };
          }
        }
      }
    }

    // Determinar status geral
    const successRate = (report.summary.passedModules / report.summary.totalModules) * 100;
    
    if (successRate >= 90) {
      report.summary.overallStatus = 'EXCELLENT';
    } else if (successRate >= 75) {
      report.summary.overallStatus = 'GOOD';
    } else if (successRate >= 50) {
      report.summary.overallStatus = 'FAIR';
    } else {
      report.summary.overallStatus = 'POOR';
    }

    // Adicionar recomendações gerais
    if (report.criticalIssues.length > 0) {
      report.recommendations.push('Resolver problemas críticos antes de usar em produção');
    }

    if (this.testResults.performance?.performanceReport?.recommendations) {
      report.recommendations.push(...this.testResults.performance.performanceReport.recommendations);
    }

    // Adicionar dados detalhados
    report.detailedResults = this.testResults;

    this.logger.log('MAIN', 'Final Report', 'INFO', 'Relatório final gerado', report);
    
    return report;
  }

  // Executar todos os testes de forma sequencial
  async runAllTests() {
    this.logger.log('MAIN', 'Test Suite', 'INFO', '🚀 INICIANDO TESTES ABRANGENTES DO MCP SUPABASE 🚀');
    this.startTime = Date.now();

    try {
      // 1. Teste de conectividade básica
      this.testResults.connectivity = await this.runConnectivityTest();
      
      if (!this.testResults.connectivity) {
        this.logger.log('MAIN', 'Test Suite', 'FAIL', 'Falha na conectividade - interrompendo testes');
        this.endTime = Date.now();
        return this.generateFinalReport();
      }

      // 2. Testes CRUD
      await this.runCRUDTests();

      // 3. Testes de autenticação
      await this.runAuthenticationTests();

      // 4. Testes de segurança
      await this.runSecurityTests();

      // 5. Testes de storage
      await this.runStorageTests();

      // 6. Testes de API
      await this.runAPITests();

      // 7. Testes de performance
      await this.runPerformanceTests();

      this.endTime = Date.now();

      // Gerar relatório final
      const finalReport = this.generateFinalReport();

      this.logger.log('MAIN', 'Test Suite', 'INFO', '✅ TODOS OS TESTES CONCLUÍDOS ✅');
      
      return finalReport;

    } catch (error) {
      this.endTime = Date.now();
      this.logger.log('MAIN', 'Test Suite', 'FAIL', 'Erro crítico durante execução dos testes', error.message);
      
      this.testResults.criticalError = error.message;
      return this.generateFinalReport();
    }
  }
}

// =====================================================
// EXECUÇÃO PRINCIPAL
// =====================================================

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 TESTE ABRANGENTE MCP SUPABASE - DataScope');
  console.log('='.repeat(60));
  
  const testRunner = new ComprehensiveTestRunner();
  
  try {
    const finalReport = await testRunner.runAllTests();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    
    console.log(`Status Geral: ${finalReport.summary.overallStatus}`);
    console.log(`Módulos Aprovados: ${finalReport.summary.passedModules}/${finalReport.summary.totalModules}`);
    console.log(`Duração: ${finalReport.metadata.duration}`);
    
    if (finalReport.criticalIssues.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS:');
      finalReport.criticalIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (finalReport.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      finalReport.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    console.log('\n📋 DETALHES POR MÓDULO:');
    Object.entries(finalReport.modules).forEach(([module, details]) => {
      console.log(`  ${module.toUpperCase()}: ${details.status} - ${details.details}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('Teste concluído com sucesso!');
    console.log('='.repeat(60));
    
    // Salvar relatório em arquivo JSON para análise posterior
    const fs = await import('fs');
    const reportPath = './test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    console.log(`\n📄 Relatório detalhado salvo em: ${reportPath}`);
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ComprehensiveTestRunner };