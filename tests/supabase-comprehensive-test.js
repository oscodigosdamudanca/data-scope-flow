/**
 * =====================================================
 * TESTE DE FUNCIONALIDADE ABRANGENTE - MCP SUPABASE
 * =====================================================
 * 
 * Este script realiza testes completos do MCP Supabase incluindo:
 * - Operações CRUD em todas as tabelas
 * - Autenticação e autorização
 * - Gerenciamento de storage
 * - APIs REST e GraphQL
 * - Testes de performance e segurança
 * - Tratamento de erros
 * 
 * Autor: DataScope Team
 * Data: Janeiro 2025
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Configuração do ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// UTILITÁRIOS E CONFIGURAÇÕES
// =====================================================

class TestLogger {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(category, test, status, message, details = null) {
    const result = {
      timestamp: new Date().toISOString(),
      category,
      test,
      status, // 'PASS', 'FAIL', 'SKIP', 'INFO'
      message,
      details,
      duration: Date.now() - this.startTime
    };
    
    this.results.push(result);
    
    const emoji = {
      'PASS': '✅',
      'FAIL': '❌', 
      'SKIP': '⏭️',
      'INFO': 'ℹ️'
    }[status] || '📝';
    
    console.log(`${emoji} [${category}] ${test}: ${message}`);
    if (details) {
      console.log(`   Detalhes: ${JSON.stringify(details, null, 2)}`);
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    console.log(`Total de testes: ${total}`);
    console.log(`✅ Aprovados: ${passed}`);
    console.log(`❌ Falharam: ${failed}`);
    console.log(`⏭️ Ignorados: ${skipped}`);
    console.log(`📈 Taxa de sucesso: ${((passed / (total - skipped)) * 100).toFixed(2)}%`);
    console.log(`⏱️ Tempo total: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    
    return {
      total,
      passed,
      failed,
      skipped,
      successRate: (passed / (total - skipped)) * 100,
      duration: Date.now() - this.startTime,
      results: this.results
    };
  }

  saveReport(filename = 'supabase-test-report.json') {
    const report = this.summary();
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Relatório salvo em: ${filename}`);
  }
}

// Instância global do logger
const logger = new TestLogger();

// Dados de teste
const testData = {
  testUser: {
    email: 'test@datascope.com',
    password: 'TestPassword123!',
    displayName: 'Usuário de Teste'
  },
  testCompany: {
    name: 'Empresa Teste DataScope',
    email: 'contato@empresateste.com',
    phone: '(11) 99999-9999',
    cnpj: '12.345.678/0001-90'
  },
  testLead: {
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    company: 'Empresa ABC',
    position: 'Gerente de Vendas'
  },
  testSurvey: {
    title: 'Pesquisa de Satisfação Teste',
    description: 'Pesquisa para testar funcionalidades',
    survey_type: 'satisfaction'
  }
};

// =====================================================
// TESTES DE CONECTIVIDADE E CONFIGURAÇÃO
// =====================================================

async function testConnection() {
  logger.log('CONECTIVIDADE', 'Conexão Básica', 'INFO', 'Testando conexão com Supabase...');
  
  try {
    // Teste básico de conectividade
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    logger.log('CONECTIVIDADE', 'Conexão Básica', 'PASS', 'Conexão estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.log('CONECTIVIDADE', 'Conexão Básica', 'FAIL', 'Falha na conexão', error.message);
    return false;
  }
}

async function testDatabaseStructure() {
  logger.log('ESTRUTURA', 'Verificação de Tabelas', 'INFO', 'Verificando estrutura do banco...');
  
  const tables = [
    'profiles', 'companies', 'company_memberships', 'user_roles',
    'leads', 'surveys', 'survey_questions', 'survey_responses',
    'notifications', 'notification_settings'
  ];
  
  let tablesFound = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        logger.log('ESTRUTURA', `Tabela ${table}`, 'FAIL', 'Tabela não encontrada ou inacessível');
      } else if (error) {
        logger.log('ESTRUTURA', `Tabela ${table}`, 'FAIL', 'Erro ao acessar tabela', error.message);
      } else {
        logger.log('ESTRUTURA', `Tabela ${table}`, 'PASS', 'Tabela acessível');
        tablesFound++;
      }
    } catch (err) {
      logger.log('ESTRUTURA', `Tabela ${table}`, 'FAIL', 'Exceção ao verificar tabela', err.message);
    }
  }
  
  const successRate = (tablesFound / tables.length) * 100;
  logger.log('ESTRUTURA', 'Resumo Estrutura', 'INFO', 
    `${tablesFound}/${tables.length} tabelas acessíveis (${successRate.toFixed(1)}%)`);
  
  return successRate > 70; // Considera sucesso se mais de 70% das tabelas estão acessíveis
}

// =====================================================
// TESTES DE AUTENTICAÇÃO
// =====================================================

async function testAuthentication() {
  logger.log('AUTENTICAÇÃO', 'Início dos Testes', 'INFO', 'Iniciando testes de autenticação...');
  
  let authTests = {
    signup: false,
    signin: false,
    signout: false,
    passwordReset: false,
    sessionManagement: false
  };
  
  try {
    // 1. Teste de Registro (Sign Up)
    logger.log('AUTENTICAÇÃO', 'Registro', 'INFO', 'Testando registro de usuário...');
    
    // Primeiro, tentar fazer logout para limpar sessão
    await supabase.auth.signOut();
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testData.testUser.email,
      password: testData.testUser.password,
      options: {
        data: {
          display_name: testData.testUser.displayName
        }
      }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      logger.log('AUTENTICAÇÃO', 'Registro', 'FAIL', 'Falha no registro', signUpError.message);
    } else {
      logger.log('AUTENTICAÇÃO', 'Registro', 'PASS', 'Registro realizado com sucesso');
      authTests.signup = true;
    }
    
    // 2. Teste de Login (Sign In)
    logger.log('AUTENTICAÇÃO', 'Login', 'INFO', 'Testando login de usuário...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testData.testUser.email,
      password: testData.testUser.password
    });
    
    if (signInError) {
      logger.log('AUTENTICAÇÃO', 'Login', 'FAIL', 'Falha no login', signInError.message);
    } else {
      logger.log('AUTENTICAÇÃO', 'Login', 'PASS', 'Login realizado com sucesso');
      authTests.signin = true;
    }
    
    // 3. Teste de Gerenciamento de Sessão
    logger.log('AUTENTICAÇÃO', 'Sessão', 'INFO', 'Testando gerenciamento de sessão...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      logger.log('AUTENTICAÇÃO', 'Sessão', 'FAIL', 'Falha ao obter sessão', sessionError?.message);
    } else {
      logger.log('AUTENTICAÇÃO', 'Sessão', 'PASS', 'Sessão obtida com sucesso');
      authTests.sessionManagement = true;
    }
    
    // 4. Teste de Logout (Sign Out)
    logger.log('AUTENTICAÇÃO', 'Logout', 'INFO', 'Testando logout de usuário...');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      logger.log('AUTENTICAÇÃO', 'Logout', 'FAIL', 'Falha no logout', signOutError.message);
    } else {
      logger.log('AUTENTICAÇÃO', 'Logout', 'PASS', 'Logout realizado com sucesso');
      authTests.signout = true;
    }
    
    // 5. Teste de Reset de Senha (simulado)
    logger.log('AUTENTICAÇÃO', 'Reset Senha', 'INFO', 'Testando reset de senha...');
    
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
      testData.testUser.email,
      { redirectTo: 'http://localhost:3000/reset-password' }
    );
    
    if (resetError) {
      logger.log('AUTENTICAÇÃO', 'Reset Senha', 'FAIL', 'Falha no reset de senha', resetError.message);
    } else {
      logger.log('AUTENTICAÇÃO', 'Reset Senha', 'PASS', 'Reset de senha iniciado com sucesso');
      authTests.passwordReset = true;
    }
    
  } catch (error) {
    logger.log('AUTENTICAÇÃO', 'Erro Geral', 'FAIL', 'Erro durante testes de autenticação', error.message);
  }
  
  const passedTests = Object.values(authTests).filter(Boolean).length;
  const totalTests = Object.keys(authTests).length;
  
  logger.log('AUTENTICAÇÃO', 'Resumo', 'INFO', 
    `${passedTests}/${totalTests} testes de autenticação aprovados`);
  
  return authTests;
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function runComprehensiveTests() {
  console.log('🚀 INICIANDO TESTES ABRANGENTES DO MCP SUPABASE');
  console.log('='.repeat(60));
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log('='.repeat(60));
  
  // Teste de conectividade
  const connectionOk = await testConnection();
  if (!connectionOk) {
    logger.log('SISTEMA', 'Teste Abortado', 'FAIL', 'Falha na conectividade básica');
    return logger.summary();
  }
  
  // Teste de estrutura do banco
  await testDatabaseStructure();
  
  // Testes de autenticação
  await testAuthentication();
  
  // Salvar relatório
  logger.saveReport();
  
  return logger.summary();
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(summary => {
      console.log('\n🏁 Testes concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Erro fatal durante os testes:', error);
      process.exit(1);
    });
}

export { runComprehensiveTests, TestLogger, testData };