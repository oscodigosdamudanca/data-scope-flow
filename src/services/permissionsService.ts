import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/utils/logger';

// Tipos para o sistema de permissões
export interface UserPermission {
  id: string;
  user_id: string;
  module: string;
  permission_type: string;
  granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModulePermission {
  id: string;
  role_type: string;
  role_name: string;
  module_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Classe de serviço para gerenciar permissões
export class PermissionsService {
  
  /**
   * Verifica se uma tabela existe no banco de dados
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      return !error;
    } catch (error) {
      console.log(`Tabela ${tableName} não encontrada:`, error);
      return false;
    }
  }

  /**
   * Cria a tabela user_permissions se não existir
   */
  async createUserPermissionsTable(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_user_permissions_table');
      
      if (error) {
        logError('Erro ao criar tabela user_permissions', error, 'PermissionsService');
        return false;
      }
      
      return true;
    } catch (error) {
        logError('Erro ao executar função de criação da tabela', error, 'PermissionsService');
        return false;
      }
  }

  /**
   * Cria a tabela module_permissions se não existir
   */
  async createModulePermissionsTable(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_module_permissions_table');
      
      if (error) {
        logError('Erro ao criar tabela module_permissions', error, 'PermissionsService');
        return false;
      }
      
      return true;
    } catch (error) {
        logError('Erro ao executar função de criação da tabela', error, 'PermissionsService');
        return false;
      }
  }

  /**
   * Inicializa as tabelas de permissões se necessário
   */
  async initializePermissionsTables(): Promise<boolean> {
    try {
      // Verificar se as tabelas existem
      const userPermissionsExists = await this.checkTableExists('user_permissions');
      const modulePermissionsExists = await this.checkTableExists('module_permissions');

      let success = true;

      // Criar tabelas se não existirem
      if (!userPermissionsExists) {
        console.log('Criando tabela user_permissions...');
        success = success && await this.createUserPermissionsTable();
      }

      if (!modulePermissionsExists) {
        console.log('Criando tabela module_permissions...');
        success = success && await this.createModulePermissionsTable();
      }

      return success;
    } catch (error) {
      logError('Erro ao inicializar tabelas de permissões', error, 'PermissionsService');
      return false;
    }
  }

  /**
   * Busca permissões de usuário
   */
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      // Verificar se a tabela existe
      const tableExists = await this.checkTableExists('user_permissions');
      if (!tableExists) {
        console.log('Tabela user_permissions não existe, retornando array vazio');
        return [];
      }

      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao buscar permissões do usuário:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logError('Erro ao verificar permissões do usuário', error, 'PermissionsService');
      return [];
    }
  }

  /**
   * Busca permissões de módulo por role
   */
  async getModulePermissions(roleName: string): Promise<ModulePermission[]> {
    try {
      // Verificar se a tabela existe
      const tableExists = await this.checkTableExists('module_permissions');
      if (!tableExists) {
        console.log('Tabela module_permissions não existe, retornando array vazio');
        return [];
      }

      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('role_name', roleName);

      if (error) {
        console.error('Erro ao buscar permissões do módulo:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar permissões do módulo:', error);
      return [];
    }
  }

  /**
   * Atualiza permissão de usuário
   */
  async updateUserPermission(
    userId: string,
    module: string,
    permissionType: string,
    granted: boolean
  ): Promise<boolean> {
    try {
      // Verificar se a tabela existe
      const tableExists = await this.checkTableExists('user_permissions');
      if (!tableExists) {
        console.log('Tabela user_permissions não existe, tentando criar...');
        const created = await this.createUserPermissionsTable();
        if (!created) {
          return false;
        }
      }

      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          module,
          permission_type: permissionType,
          granted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module,permission_type'
        });

      if (error) {
        console.error('Erro ao atualizar permissão do usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissão do usuário:', error);
      return false;
    }
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async checkUserPermission(
    userId: string,
    module: string,
    permissionType: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const permission = permissions.find(
        p => p.module === module && p.permission_type === permissionType
      );
      
      return permission?.granted || false;
    } catch (error) {
      console.error('Erro ao verificar permissão do usuário:', error);
      return false;
    }
  }

  /**
   * Busca todas as permissões de módulos
   */
  async getAllModulePermissions(): Promise<ModulePermission[]> {
    try {
      // Verificar se a tabela existe
      const tableExists = await this.checkTableExists('module_permissions');
      if (!tableExists) {
        console.log('Tabela module_permissions não existe, retornando array vazio');
        return [];
      }

      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .order('role_name', { ascending: true })
        .order('module_name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar todas as permissões de módulos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todas as permissões de módulos:', error);
      return [];
    }
  }
}

// Instância singleton do serviço
export const permissionsService = new PermissionsService();