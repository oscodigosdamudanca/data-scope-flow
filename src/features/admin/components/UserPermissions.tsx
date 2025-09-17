import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Tipos de permissões por módulo
type ModulePermission = {
  id: string;
  name: string;
  description: string;
  checked: boolean;
};

type ModulePermissions = {
  [key: string]: {
    name: string;
    permissions: ModulePermission[];
  };
};

// Interface para as props do componente
interface UserPermissionsProps {
  userId: string;
  userName: string;
  onSave: () => void;
  onCancel: () => void;
}

// Componente principal de gerenciamento de permissões
const UserPermissions: React.FC<UserPermissionsProps> = ({
  userId,
  userName,
  onSave,
  onCancel
}) => {
  // Estado para armazenar as permissões do usuário
  const [permissions, setPermissions] = useState<ModulePermissions>({
    leads: {
      name: 'Leads',
      permissions: [
        { id: 'leads:view', name: 'Visualizar', description: 'Visualizar leads', checked: false },
        { id: 'leads:create', name: 'Criar', description: 'Criar novos leads', checked: false },
        { id: 'leads:edit', name: 'Editar', description: 'Editar leads existentes', checked: false },
        { id: 'leads:delete', name: 'Excluir', description: 'Excluir leads', checked: false },
      ]
    },
    surveys: {
      name: 'Pesquisas',
      permissions: [
        { id: 'surveys:view', name: 'Visualizar', description: 'Visualizar pesquisas', checked: false },
        { id: 'surveys:create', name: 'Criar', description: 'Criar novas pesquisas', checked: false },
        { id: 'surveys:edit', name: 'Editar', description: 'Editar pesquisas existentes', checked: false },
        { id: 'surveys:delete', name: 'Excluir', description: 'Excluir pesquisas', checked: false },
      ]
    },
    raffles: {
      name: 'Sorteios',
      permissions: [
        { id: 'raffles:view', name: 'Visualizar', description: 'Visualizar sorteios', checked: false },
        { id: 'raffles:create', name: 'Criar', description: 'Criar novos sorteios', checked: false },
        { id: 'raffles:edit', name: 'Editar', description: 'Editar sorteios existentes', checked: false },
        { id: 'raffles:execute', name: 'Executar', description: 'Executar sorteios', checked: false },
      ]
    },
    reports: {
      name: 'Relatórios',
      permissions: [
        { id: 'reports:view', name: 'Visualizar', description: 'Visualizar relatórios', checked: false },
        { id: 'reports:export', name: 'Exportar', description: 'Exportar relatórios', checked: false },
      ]
    },
    users: {
      name: 'Usuários',
      permissions: [
        { id: 'users:view', name: 'Visualizar', description: 'Visualizar usuários', checked: false },
        { id: 'users:create', name: 'Criar', description: 'Criar novos usuários', checked: false },
        { id: 'users:edit', name: 'Editar', description: 'Editar usuários existentes', checked: false },
        { id: 'users:delete', name: 'Excluir', description: 'Excluir usuários', checked: false },
        { id: 'users:permissions', name: 'Gerenciar Permissões', description: 'Gerenciar permissões de usuários', checked: false },
      ]
    }
  });

  // Função para alternar o estado de uma permissão
  const togglePermission = (moduleKey: string, permissionId: string) => {
    setPermissions(prevPermissions => {
      const updatedPermissions = { ...prevPermissions };
      const modulePermissions = [...updatedPermissions[moduleKey].permissions];
      
      const permissionIndex = modulePermissions.findIndex(p => p.id === permissionId);
      if (permissionIndex !== -1) {
        modulePermissions[permissionIndex] = {
          ...modulePermissions[permissionIndex],
          checked: !modulePermissions[permissionIndex].checked
        };
      }
      
      updatedPermissions[moduleKey] = {
        ...updatedPermissions[moduleKey],
        permissions: modulePermissions
      };
      
      return updatedPermissions;
    });
  };

  // Função para salvar as permissões
  const handleSavePermissions = () => {
    // Aqui seria implementada a lógica para salvar as permissões no banco de dados
    console.log('Salvando permissões para o usuário:', userId);
    
    // Extrair as permissões marcadas para salvar
    const permissionsToSave = Object.keys(permissions).reduce((acc, moduleKey) => {
      const checkedPermissions = permissions[moduleKey].permissions
        .filter(p => p.checked)
        .map(p => p.id);
      
      return [...acc, ...checkedPermissions];
    }, [] as string[]);
    
    console.log('Permissões a serem salvas:', permissionsToSave);
    
    // Simulação de sucesso
    toast({
      title: "Permissões salvas",
      description: `As permissões de ${userName} foram atualizadas com sucesso.`,
    });
    
    onSave();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciar Permissões</CardTitle>
        <CardDescription>
          Configure as permissões do usuário {userName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.keys(permissions).map(moduleKey => (
            <div key={moduleKey} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{permissions[moduleKey].name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions[moduleKey].permissions.map(permission => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={permission.checked}
                      onCheckedChange={() => togglePermission(moduleKey, permission.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSavePermissions}>
            Salvar Permissões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissions;