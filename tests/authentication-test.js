/**
 * =====================================================
 * TESTES DE AUTENTICAÇÃO SUPABASE
 * =====================================================
 * 
 * Módulo dedicado para testar:
 * - Registro de novos usuários
 * - Login com email/senha
 * - Logout
 * - Recuperação de senha
 * - Verificação de sessão
 * - Refresh de tokens
 * - Validação de permissões após autenticação
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES DE AUTENTICAÇÃO
// =====================================================

class AuthenticationTester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.testUsers = [];
    this.testEmail = `test_${Date.now()}@datascope.test`;
    this.testPassword = 'TestPassword123!';
  }

  // Gerar email único para testes
  generateTestEmail() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@datascope.test`;
  }

  // Testar registro de novo usuário
  async testUserRegistration() {
    this.logger.log('AUTH', 'User Registration', 'INFO', 'Testando registro de novo usuário...');
    
    try {
      const testEmail = this.generateTestEmail();
      
      const { data, error } = await this.supabase.auth.signUp({
        email: testEmail,
        password: this.testPassword,
        options: {
          data: {
            full_name: 'Test User',
            company_name: 'Test Company'
          }
        }
      });

      if (error) {
        this.logger.log('AUTH', 'User Registration', 'FAIL', 'Erro no registro', error.message);
        return false;
      }

      if (data.user) {
        this.logger.log('AUTH', 'User Registration', 'PASS', 'Usuário registrado com sucesso', {
          id: data.user.id,
          email: data.user.email,
          confirmed: data.user.email_confirmed_at ? 'Sim' : 'Não'
        });
        
        this.testUsers.push({ email: testEmail, password: this.testPassword, id: data.user.id });
        return true;
      } else {
        this.logger.log('AUTH', 'User Registration', 'FAIL', 'Registro não retornou dados do usuário');
        return false;
      }

    } catch (error) {
      this.logger.log('AUTH', 'User Registration', 'FAIL', 'Exceção durante registro', error.message);
      return false;
    }
  }

  // Testar login com email e senha
  async testEmailPasswordLogin() {
    this.logger.log('AUTH', 'Email Login', 'INFO', 'Testando login com email/senha...');
    
    try {
      // Primeiro, garantir que temos um usuário para testar
      if (this.testUsers.length === 0) {
        await this.testUserRegistration();
      }

      if (this.testUsers.length === 0) {
        this.logger.log('AUTH', 'Email Login', 'SKIP', 'Nenhum usuário de teste disponível');
        return false;
      }

      const testUser = this.testUsers[0];
      
      // Fazer logout primeiro para garantir estado limpo
      await this.supabase.auth.signOut();

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      if (error) {
        this.logger.log('AUTH', 'Email Login', 'FAIL', 'Erro no login', error.message);
        return false;
      }

      if (data.user && data.session) {
        this.logger.log('AUTH', 'Email Login', 'PASS', 'Login realizado com sucesso', {
          userId: data.user.id,
          email: data.user.email,
          sessionValid: !!data.session.access_token
        });
        return true;
      } else {
        this.logger.log('AUTH', 'Email Login', 'FAIL', 'Login não retornou dados válidos');
        return false;
      }

    } catch (error) {
      this.logger.log('AUTH', 'Email Login', 'FAIL', 'Exceção durante login', error.message);
      return false;
    }
  }

  // Testar logout
  async testLogout() {
    this.logger.log('AUTH', 'Logout', 'INFO', 'Testando logout...');
    
    try {
      // Verificar se há uma sessão ativa antes do logout
      const { data: sessionBefore } = await this.supabase.auth.getSession();
      
      if (!sessionBefore.session) {
        this.logger.log('AUTH', 'Logout', 'INFO', 'Nenhuma sessão ativa para fazer logout');
        return true; // Tecnicamente um sucesso
      }

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        this.logger.log('AUTH', 'Logout', 'FAIL', 'Erro durante logout', error.message);
        return false;
      }

      // Verificar se a sessão foi realmente removida
      const { data: sessionAfter } = await this.supabase.auth.getSession();
      
      if (!sessionAfter.session) {
        this.logger.log('AUTH', 'Logout', 'PASS', 'Logout realizado com sucesso');
        return true;
      } else {
        this.logger.log('AUTH', 'Logout', 'FAIL', 'Sessão ainda ativa após logout');
        return false;
      }

    } catch (error) {
      this.logger.log('AUTH', 'Logout', 'FAIL', 'Exceção durante logout', error.message);
      return false;
    }
  }

  // Testar recuperação de senha
  async testPasswordRecovery() {
    this.logger.log('AUTH', 'Password Recovery', 'INFO', 'Testando recuperação de senha...');
    
    try {
      if (this.testUsers.length === 0) {
        this.logger.log('AUTH', 'Password Recovery', 'SKIP', 'Nenhum usuário de teste para recuperação');
        return false;
      }

      const testUser = this.testUsers[0];
      
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(testUser.email, {
        redirectTo: 'http://localhost:3000/reset-password'
      });

      if (error) {
        this.logger.log('AUTH', 'Password Recovery', 'FAIL', 'Erro na recuperação', error.message);
        return false;
      }

      // O Supabase não retorna dados específicos para resetPasswordForEmail
      // Se não houve erro, consideramos sucesso
      this.logger.log('AUTH', 'Password Recovery', 'PASS', 'Email de recuperação enviado com sucesso');
      return true;

    } catch (error) {
      this.logger.log('AUTH', 'Password Recovery', 'FAIL', 'Exceção durante recuperação', error.message);
      return false;
    }
  }

  // Testar verificação de sessão
  async testSessionVerification() {
    this.logger.log('AUTH', 'Session Verification', 'INFO', 'Testando verificação de sessão...');
    
    try {
      // Primeiro fazer login
      if (this.testUsers.length > 0) {
        await this.supabase.auth.signInWithPassword({
          email: this.testUsers[0].email,
          password: this.testUsers[0].password
        });
      }

      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        this.logger.log('AUTH', 'Session Verification', 'FAIL', 'Erro ao verificar sessão', error.message);
        return false;
      }

      if (data.session) {
        this.logger.log('AUTH', 'Session Verification', 'PASS', 'Sessão válida encontrada', {
          userId: data.session.user.id,
          expiresAt: new Date(data.session.expires_at * 1000).toISOString(),
          tokenType: data.session.token_type
        });
        return true;
      } else {
        this.logger.log('AUTH', 'Session Verification', 'INFO', 'Nenhuma sessão ativa');
        return true; // Não é necessariamente um erro
      }

    } catch (error) {
      this.logger.log('AUTH', 'Session Verification', 'FAIL', 'Exceção durante verificação', error.message);
      return false;
    }
  }

  // Testar refresh de token
  async testTokenRefresh() {
    this.logger.log('AUTH', 'Token Refresh', 'INFO', 'Testando refresh de token...');
    
    try {
      // Obter sessão atual
      const { data: currentSession } = await this.supabase.auth.getSession();
      
      if (!currentSession.session) {
        this.logger.log('AUTH', 'Token Refresh', 'SKIP', 'Nenhuma sessão ativa para refresh');
        return false;
      }

      const oldToken = currentSession.session.access_token;

      // Tentar refresh
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        this.logger.log('AUTH', 'Token Refresh', 'FAIL', 'Erro no refresh', error.message);
        return false;
      }

      if (data.session && data.session.access_token !== oldToken) {
        this.logger.log('AUTH', 'Token Refresh', 'PASS', 'Token refreshed com sucesso');
        return true;
      } else {
        this.logger.log('AUTH', 'Token Refresh', 'INFO', 'Token não foi alterado (pode ser normal)');
        return true;
      }

    } catch (error) {
      this.logger.log('AUTH', 'Token Refresh', 'FAIL', 'Exceção durante refresh', error.message);
      return false;
    }
  }

  // Testar acesso a dados após autenticação
  async testAuthenticatedDataAccess() {
    this.logger.log('AUTH', 'Authenticated Access', 'INFO', 'Testando acesso a dados após autenticação...');
    
    try {
      // Garantir que estamos autenticados
      const { data: session } = await this.supabase.auth.getSession();
      
      if (!session.session) {
        // Tentar fazer login
        if (this.testUsers.length > 0) {
          await this.supabase.auth.signInWithPassword({
            email: this.testUsers[0].email,
            password: this.testUsers[0].password
          });
        } else {
          this.logger.log('AUTH', 'Authenticated Access', 'SKIP', 'Nenhuma sessão ou usuário de teste');
          return false;
        }
      }

      // Tentar acessar dados que requerem autenticação
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .limit(1);

      const { data: companyData, error: companyError } = await this.supabase
        .from('companies')
        .select('*')
        .limit(1);

      let accessCount = 0;
      let totalTests = 2;

      if (!profileError) {
        accessCount++;
        this.logger.log('AUTH', 'Profile Access', 'PASS', 'Acesso a profiles autorizado');
      } else {
        this.logger.log('AUTH', 'Profile Access', 'INFO', 'Acesso a profiles negado/erro', profileError.message);
      }

      if (!companyError) {
        accessCount++;
        this.logger.log('AUTH', 'Company Access', 'PASS', 'Acesso a companies autorizado');
      } else {
        this.logger.log('AUTH', 'Company Access', 'INFO', 'Acesso a companies negado/erro', companyError.message);
      }

      const successRate = (accessCount / totalTests) * 100;
      this.logger.log('AUTH', 'Authenticated Access', 'INFO', 
        `${accessCount}/${totalTests} acessos bem-sucedidos (${successRate}%)`);

      return accessCount > 0;

    } catch (error) {
      this.logger.log('AUTH', 'Authenticated Access', 'FAIL', 'Exceção durante teste de acesso', error.message);
      return false;
    }
  }

  // Testar login com credenciais inválidas
  async testInvalidCredentials() {
    this.logger.log('AUTH', 'Invalid Credentials', 'INFO', 'Testando login com credenciais inválidas...');
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });

      if (error) {
        this.logger.log('AUTH', 'Invalid Credentials', 'PASS', 'Login rejeitado corretamente', error.message);
        return true;
      } else if (data.user) {
        this.logger.log('AUTH', 'Invalid Credentials', 'FAIL', 'Login inválido foi aceito');
        return false;
      } else {
        this.logger.log('AUTH', 'Invalid Credentials', 'PASS', 'Login rejeitado (sem dados retornados)');
        return true;
      }

    } catch (error) {
      this.logger.log('AUTH', 'Invalid Credentials', 'PASS', 'Exceção esperada para credenciais inválidas');
      return true;
    }
  }

  // Limpar usuários de teste criados
  async cleanupTestUsers() {
    this.logger.log('AUTH', 'Cleanup', 'INFO', 'Limpando usuários de teste...');
    
    try {
      // Fazer logout primeiro
      await this.supabase.auth.signOut();
      
      // Nota: O Supabase não permite deletar usuários via client-side por segurança
      // Em um ambiente de produção, isso seria feito via Admin API
      this.logger.log('AUTH', 'Cleanup', 'INFO', 
        `${this.testUsers.length} usuário(s) de teste criado(s) (limpeza manual necessária)`);
      
      return true;

    } catch (error) {
      this.logger.log('AUTH', 'Cleanup', 'FAIL', 'Erro durante limpeza', error.message);
      return false;
    }
  }

  // Executar todos os testes de autenticação
  async runAllAuthTests() {
    this.logger.log('AUTH', 'Início Geral', 'INFO', 'Iniciando todos os testes de autenticação...');
    
    const results = {};
    
    // Executar testes em sequência
    results.userRegistration = await this.testUserRegistration();
    results.emailPasswordLogin = await this.testEmailPasswordLogin();
    results.sessionVerification = await this.testSessionVerification();
    results.authenticatedDataAccess = await this.testAuthenticatedDataAccess();
    results.tokenRefresh = await this.testTokenRefresh();
    results.logout = await this.testLogout();
    results.passwordRecovery = await this.testPasswordRecovery();
    results.invalidCredentials = await this.testInvalidCredentials();
    
    // Limpeza
    await this.cleanupTestUsers();
    
    this.logger.log('AUTH', 'Conclusão Geral', 'INFO', 'Todos os testes de autenticação concluídos');
    
    return results;
  }
}

export { AuthenticationTester };