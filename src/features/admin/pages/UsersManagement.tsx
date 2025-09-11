import React, { useState } from 'react';
import { UsersList } from '../components/UsersList';
import { UserForm } from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import type { UserWithRoles, CreateUserData, UpdateUserData } from '../hooks/useUsers';

type ViewMode = 'list' | 'create' | 'edit';

const UsersManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const { 
    users, 
    loading, 
    error, 
    refetch, 
    createUser, 
    updateUser, 
    deleteUser, 
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    isCreating, 
    isUpdating, 
    isDeleting 
  } = useUsers();

  const handleEditUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleSubmit = async (data: CreateUserData | { userId: string; userData: UpdateUserData }) => {
    try {
      if ('userId' in data) {
        // Modo edição
        await updateUserMutation.mutateAsync(data);
      } else {
        // Modo criação
        await createUserMutation.mutateAsync(data);
      }
      setViewMode('list');
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };



  return (
    <div className="container mx-auto p-4 space-y-6">
      {viewMode === 'list' && (
        <UsersList
          onCreateUser={() => setViewMode('create')}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
      
      {(viewMode === 'create' || viewMode === 'edit') && (
        <UserForm
          user={viewMode === 'edit' ? selectedUser : undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setViewMode('list');
            setSelectedUser(null);
          }}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default UsersManagement;