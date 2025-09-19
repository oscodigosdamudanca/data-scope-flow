import { useState, useEffect, useCallback } from 'react';
import { permissionsService, UserPermission, ModulePermission } from '@/services/permissionsService';
import { useToast } from '@/hooks/use-toast';

// Hook para gerenciar permissões de usuário
export const useUserPermissions = (userId?: string) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userPermissions = await permissionsService.getUserPermissions(userId);
      setPermissions(userPermissions);
    } catch (err) {
      const errorMessage = 'Erro ao carregar permissões do usuário';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const updatePermission = useCallback(async (
    module: string,
    permissionType: string,
    granted: boolean
  ) => {
    if (!userId) return false;

    try {
      const success = await permissionsService.updateUserPermission(
        userId,
        module,
        permissionType,
        granted
      );

      if (success) {
        // Atualizar o estado local
        setPermissions(prev => {
          const existingIndex = prev.findIndex(
            p => p.module === module && p.permission_type === permissionType
          );

          if (existingIndex >= 0) {
            // Atualizar permissão existente
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              granted,
              updated_at: new Date().toISOString()
            };
            return updated;
          } else {
            // Adicionar nova permissão
            const newPermission: UserPermission = {
              id: `temp-${Date.now()}`,
              user_id: userId,
              module,
              permission_type: permissionType,
              granted,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            return [...prev, newPermission];
          }
        });

        toast({
          title: 'Sucesso',
          description: 'Permissão atualizada com sucesso',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar permissão',
          variant: 'destructive',
        });
      }

      return success;
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar permissão',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  const checkPermission = useCallback((module: string, permissionType: string) => {
    const permission = permissions.find(
      p => p.module === module && p.permission_type === permissionType
    );
    return permission?.granted || false;
  }, [permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    updatePermission,
    checkPermission,
    refetch: fetchPermissions
  };
};

// Hook para gerenciar permissões de módulos
export const useModulePermissions = () => {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const modulePermissions = await permissionsService.getAllModulePermissions();
      setPermissions(modulePermissions);
    } catch (err) {
      const errorMessage = 'Erro ao carregar permissões dos módulos';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getPermissionsByRole = useCallback((roleName: string) => {
    return permissions.filter(p => p.role_name === roleName);
  }, [permissions]);

  const checkModulePermission = useCallback((roleName: string, moduleName: string) => {
    const permission = permissions.find(
      p => p.role_name === roleName && p.module_name === moduleName
    );
    return permission?.is_active || false;
  }, [permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    getPermissionsByRole,
    checkModulePermission,
    refetch: fetchPermissions
  };
};

// Hook para inicializar o sistema de permissões
export const usePermissionsInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await permissionsService.initializePermissionsTables();
      
      if (success) {
        setInitialized(true);
        toast({
          title: 'Sucesso',
          description: 'Sistema de permissões inicializado com sucesso',
        });
      } else {
        const errorMessage = 'Erro ao inicializar sistema de permissões';
        setError(errorMessage);
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = 'Erro ao inicializar sistema de permissões';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    initialized,
    loading,
    error,
    reinitialize: initialize
  };
};