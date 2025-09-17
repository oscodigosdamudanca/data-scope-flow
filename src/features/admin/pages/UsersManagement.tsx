import React, { useState } from 'react';
import { UsersList } from '../components/UsersList';
import { UserForm } from '../components/UserForm';
import { UserPermissions } from '../components/UserPermissions';
import { useUsers } from '../hooks/useUsers';
import { CreateUserData, UpdateUserData, UserWithRoles } from '../types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit' | 'permissions';

const UsersManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [activeTab, setActiveTab] = useState<string>("details");
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

  const handleManagePermissions = (user: UserWithRoles) => {
    setSelectedUser(user);
    setViewMode('permissions');
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

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {viewMode === 'list' && (
        <UsersList
          onCreateUser={() => setViewMode('create')}
          onEditUser={handleEditUser}
          onManagePermissions={handleManagePermissions}
          onDeleteUser={handleDeleteUser}
        />
      )}
      
      {(viewMode === 'create' || viewMode === 'edit') && (
        <UserForm
          user={viewMode === 'edit' ? selectedUser : undefined}
          onSubmit={handleSubmit}
          onCancel={handleBackToList}
          isLoading={isCreating || isUpdating}
        />
      )}

      {viewMode === 'permissions' && selectedUser && (
        <UserPermissions
          user={selectedUser}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )}
    </div>
  );
};

export default UsersManagement;