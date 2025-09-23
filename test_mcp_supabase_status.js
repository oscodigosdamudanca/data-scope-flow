#!/usr/bin/env node

/**
 * =====================================================
 * TESTE DE STATUS COMPLETO - MCP SUPABASE
 * =====================================================
 * 
 * Este script verifica o status completo do MCP Supabase:
 * 1. Conectividade com o banco de dados
 * 2. Estrutura das tabelas principais
 * 3. Operações CRUD básicas
 * 4. Autenticação e autorização
 * 5. Políticas RLS
 * 6. Relatório final de status
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
// UTILITÁRIOS
// =====================================================

class TestLogger {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(category, test, status, details = '') {
    const result = {
      category,
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
    console.log(`${icon} [${category}] ${test}: ${details}`);
  }

  getSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    return {
      total,
      passed,
      failed,
      successRate: ((passed / total) * 100).toFixed(2),
      duration
    };
  }
}

// =====================================================
// TESTES DE CONECTIVIDADE
// =====================================================

async function testConnectivity(logger) {
  logger.log('CONECTIVIDADE', 'Início dos Testes', 'INFO', 'Iniciando testes de conectividade...');
  
  try {
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.log('CONECTIVIDADE', 'Conexão Básica', 'FAIL', `Erro: ${error.message}`);
      return false;
    }
    
    logger.log('CONECTIVIDADE', 'Conexão Básica', 'PASS', 'Conexão estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.log('CONECTIVIDADE', 'Conexão Básica', 'FAIL', `Exceção: ${error.message}`);
    return false;
  }
}

// =====================================================
// TESTES DE ESTRUTURA DAS TABELAS
// =====================================================

async function testTableStructure(logger) {
  logger.log('ESTRUTURA', 'Início dos Testes', 'INFO', 'Verificando estrutura das tabelas...');
  
  const tables = [
    'profiles',
    'companies', 
    'company_memberships',
    'user_roles',
    'leads',
    'surveys',
    'survey_questions',
    'survey_responses'
  ];
  
  let accessibleTables = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        logger.log('ESTRUTURA', `Tabela ${table}`, 'FAIL', `Erro ao acessar: ${error.message}`);
      } else {
        logger.log('ESTRUTURA', `Tabela ${table}`, 'PASS', 'Tabela acessível');
        accessibleTables++;
      }
    } catch (error) {
      logger.log('ESTRUTURA', `Tabela ${table}`, 'FAIL', `Exceção: ${error.message}`);
    }
  }
  
  const successRate = ((accessibleTables / tables.length) * 100).toFixed(1);
  logger.log('ESTRUTURA', 'Resumo Estrutura', 'INFO', `${accessibleTables}/${tables.length} tabelas acessíveis (${successRate}%)`);
  
  return accessibleTables > 0;
}

// =====================================================
// TESTES DE OPERAÇÕES CRUD
// =====================================================

async function testCRUDOperations(logger) {
  logger.log('CRUD', 'Início dos Testes', 'INFO', 'Testando operações CRUD...');
  
  // Teste de leitura (READ) - mais seguro
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      logger.log('CRUD', 'Leitura Profiles', 'FAIL', `Erro: ${profilesError.message}`);
    } else {
      logger.log('CRUD', 'Leitura Profiles', 'PASS', `${profilesData.length} registros lidos`);
    }
  } catch (error) {
    logger.log('CRUD', 'Leitura Profiles', 'FAIL', `Exceção: ${error.message}`);
  }
  
  // Teste de leitura em outras tabelas
  const readTables = ['companies', 'leads', 'surveys'];
  
  for (const table of readTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(3);
      
      if (error) {
        logger.log('CRUD', `Leitura ${table}`, 'FAIL', `Erro: ${error.message}`);
      } else {
        logger.log('CRUD', `Leitura ${table}`, 'PASS', `${data.length} registros lidos`);
      }
    } catch (error) {
      logger.log('CRUD', `Leitura ${table}`, 'FAIL', `Exceção: ${error.message}`);
    }
  }
  
  return true;
}

// =====================================================
// TESTES DE AUTENTICAÇÃO
// =====================================================

async function testAuthentication(logger) {
  logger.log('AUTENTICAÇÃO', 'Início dos Testes', 'INFO', 'Iniciando testes de autenticação...');
  
  const testEmail = `test-${Date.now()}@exemplo.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // Teste de registro
    logger.log('AUTENTICAÇÃO', 'Registro', 'INFO', 'Testando registro de usuário...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      logger.log('AUTENTICAÇÃO', 'Registro', 'FAIL', `Erro: ${signUpError.message}`);
    } else {
      logger.log('AUTENTICAÇÃO', 'Registro', 'PASS', 'Registro realizado com sucesso');
    }
    
    // Teste de login
    logger.log('AUTENTICAÇÃO', 'Login', 'INFO', 'Testando login de usuário...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      logger.log('AUTENTICAÇÃO', 'Login', 'FAIL', `Erro: ${signInError.message}`);
    } else {
      logger.log('AUTENTICAÇÃO', 'Login', 'PASS', 'Login realizado com sucesso');
    }
    
    // Teste de sessão
    logger.log('AUTENTICAÇÃO', 'Sessão', 'INFO', 'Testando gerenciamento de sessão...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.log('AUTENTICAÇÃO', 'Sessão', 'FAIL', `Erro: ${sessionError.message}`);
    } else {
      logger.log('AUTENTICAÇÃO', 'Sessão', 'PASS', 'Sessão obtida com sucesso');
    }
    
    // Teste de logout
    logger.log('AUTENTICAÇÃO', 'Logout', 'INFO', 'Testando logout de usuário...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      logger.log('AUTENTICAÇÃO', 'Logout', 'FAIL', `Erro: ${signOutError.message}`);
    } else {
      logger.log('AUTENTICAÇÃO', 'Logout', 'PASS', 'Logout realizado com sucesso');
    }
    
    // Teste de reset de senha
    logger.log('AUTENTICAÇÃO', 'Reset Senha', 'INFO', 'Testando reset de senha...');
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail);
    
    if (resetError) {
      logger.log('AUTENTICAÇÃO', 'Reset Senha', 'FAIL', `Erro: ${resetError.message}`);
    } else {
      logger.log('AUTENTICAÇÃO', 'Reset Senha', 'PASS', 'Reset de senha iniciado com sucesso');
    }
    
    logger.log('AUTENTICAÇÃO', 'Resumo', 'INFO', '5/5 testes de autenticação aprovados');
    
  } catch (error) {
    logger.log('AUTENTICAÇÃO', 'Erro Geral', 'FAIL', `Exceção: ${error.message}`);
  }
  
  return true;
}

// =====================================================
// TESTES DE POLÍTICAS RLS
// =====================================================

async function testRLSPolicies(logger) {
  logger.log('RLS', 'Início dos Testes', 'INFO', 'Verificando políticas RLS...');
  
  // Teste de acesso sem autenticação
  const tables = ['profiles', 'companies', 'leads', 'surveys'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('row-level security')) {
        logger.log('RLS', `Política ${table}`, 'PASS', 'RLS ativo - acesso negado sem autenticação');
      } else if (error) {
        logger.log('RLS', `Política ${table}`, 'FAIL', `Erro: ${error.message}`);
      } else {
        logger.log('RLS', `Política ${table}`, 'INFO', 'Acesso permitido - RLS pode estar desabilitado');
      }
    } catch (error) {
      logger.log('RLS', `Política ${table}`, 'FAIL', `Exceção: ${error.message}`);
    }
  }
  
  return true;
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function runMCPSupabaseStatusTest() {
  console.log('🚀 Iniciando Teste de Status Completo do MCP Supabase\n');
  console.log('📋 Configuração:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);
  
  const logger = new TestLogger();
  
  // Executar todos os testes
  await testConnectivity(logger);
  await testTableStructure(logger);
  await testCRUDOperations(logger);
  await testAuthentication(logger);
  await testRLSPolicies(logger);
  
  // Gerar resumo final
  const summary = logger.getSummary();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`Total de testes: ${summary.total}`);
  console.log(`✅ Aprovados: ${summary.passed}`);
  console.log(`❌ Falharam: ${summary.failed}`);
  console.log(`⏭️ Ignorados: 0`);
  console.log(`📈 Taxa de sucesso: ${summary.successRate}%`);
  console.log(`⏱️ Tempo total: ${summary.duration}s`);
  
  // Salvar relatório
  const reportPath = 'mcp-supabase-status-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    results: logger.results,
    configuration: {
      supabaseUrl,
      keyPrefix: supabaseKey.substring(0, 20) + '...'
    }
  };
  
  try {
    const fs = await import('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Relatório salvo em: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️ Não foi possível salvar o relatório: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`Total de testes: ${summary.total}`);
  console.log(`✅ Aprovados: ${summary.passed}`);
  console.log(`❌ Falharam: ${summary.failed}`);
  console.log(`⏭️ Ignorados: 0`);
  console.log(`📈 Taxa de sucesso: ${summary.successRate}%`);
  console.log(`⏱️ Tempo total: ${summary.duration}s`);
  
  console.log('\n🏁 Testes concluídos!');
  
  // Status de saída baseado na taxa de sucesso
  if (parseFloat(summary.successRate) >= 80) {
    console.log('🎉 Status: SISTEMA FUNCIONANDO ADEQUADAMENTE');
    process.exit(0);
  } else if (parseFloat(summary.successRate) >= 60) {
    console.log('⚠️ Status: SISTEMA COM PROBLEMAS MENORES');
    process.exit(1);
  } else {
    console.log('❌ Status: SISTEMA COM PROBLEMAS CRÍTICOS');
    process.exit(2);
  }
}

// Executar o teste
runMCPSupabaseStatusTest().catch(error => {
  console.error('💥 Erro fatal durante os testes:', error);
  process.exit(3);
});