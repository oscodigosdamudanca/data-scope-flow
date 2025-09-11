import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AppRole = Enums<'app_role'>;

type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

type UserWithRoles = {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_roles: UserRole[];
};

type CreateUserData = {
  email: string;
  password: string;
  display_name?: string;
  phone?: string;
  roles: AppRole[];
};

type UpdateUserData = {
  display_name?: string;
  phone?: string;
  roles?: AppRole[];
};

export const useUsers = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os usuários com seus papéis
  const { data: users = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      try {
        setError(null);

        // Buscar emails dos usuários autenticados
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }

        if (!authUsers || authUsers.length === 0) {
          return [];
        }

        // Buscar perfis dos usuários
        const userIds = authUsers.map(user => user.id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Buscar papéis dos usuários separadamente
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .in('user_id', userIds);

        if (rolesError) throw rolesError;

        // Combinar dados
        const usersWithRoles: UserWithRoles[] = authUsers.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          const roles = (userRoles || []).filter(r => r.user_id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email || '',
            display_name: profile?.display_name || null,
            phone: profile?.phone || null,
            created_at: authUser.created_at,
            updated_at: profile?.updated_at || authUser.updated_at,
            user_roles: roles
          };
        });

        return usersWithRoles;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar usuários';
        setError(errorMessage);
        throw err;
      }
    }
  });

  // Criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      try {
        setError(null);

        // Criar usuário no auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (authError || !authData.user) {
          throw authError || new Error('Falha ao criar usuário');
        }

        const userId = authData.user.id;

        // Criar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: userData.display_name || null,
            phone: userData.phone || null
          });

        if (profileError) {
          // Se falhar ao criar perfil, tentar deletar o usuário criado
          await supabase.auth.admin.deleteUser(userId);
          throw profileError;
        }

        // Criar papéis do usuário
        if (userData.roles && userData.roles.length > 0) {
          const roleInserts = userData.roles.map(role => ({
            user_id: userId,
            role
          }));

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleInserts);

          if (rolesError) {
            // Se falhar ao criar papéis, tentar deletar o usuário criado
            await supabase.auth.admin.deleteUser(userId);
            throw rolesError;
          }
        }

        return authData.user;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar usuário';
        setError(errorMessage);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      toast.error(errorMessage);
    }
  });

  // Atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UpdateUserData }) => {
      try {
        setError(null);

        // Atualizar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: userData.display_name,
            phone: userData.phone
          })
          .eq('id', userId);

        if (profileError) throw profileError;

        // Atualizar papéis se fornecidos
        if (userData.roles !== undefined) {
          // Deletar papéis existentes
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

          if (deleteError) throw deleteError;

          // Inserir novos papéis
          if (userData.roles.length > 0) {
            const roleInserts = userData.roles.map(role => ({
              user_id: userId,
              role
            }));

            const { error: rolesError } = await supabase
              .from('user_roles')
              .insert(roleInserts);

            if (rolesError) throw rolesError;
          }
        }

        return { userId, userData };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
        setError(errorMessage);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      toast.error(errorMessage);
    }
  });

  // Deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        setError(null);

        // Deletar papéis do usuário
        const { error: rolesError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (rolesError) throw rolesError;

        // Deletar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileError) throw profileError;

        // Deletar usuário do auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) throw authError;

        return userId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar usuário';
        setError(errorMessage);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário deletado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário';
      toast.error(errorMessage);
    }
  });

  return {
    users,
    loading: isLoading,
    error: error || (queryError instanceof Error ? queryError.message : null),
    refetch,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending
  };
};

export type { UserWithRoles, CreateUserData, UpdateUserData, AppRole };