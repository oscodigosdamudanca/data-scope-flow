import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos de usuários no sistema
type UserRole = 'developer' | 'organizer' | 'admin' | 'interviewer';

// Recursos do sistema que podem ter permissões
type Resource = {
  id: string;
  name: string;
  description: string;
};

// Permissões possíveis para cada recurso
type Permission = 'read' | 'write' | 'delete' | 'manage';

// Matriz de permissões
type PermissionMatrix = {
  [role in UserRole]: {
    [resourceId: string]: Permission[];
  };
};

interface PermissionMatrixProps {
  onSave?: (matrix: PermissionMatrix) => void;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ onSave }) => {
  const { toast } = useToast();

  // Recursos do sistema
  const resources: Resource[] = [
    { id: 'turbo_form', name: 'Formulário Turbo', description: 'Formulário de captura rápida de leads' },
    { id: 'leads', name: 'Leads', description: 'Gerenciamento de leads capturados' },
    { id: 'reports', name: 'Relatórios', description: 'Relatórios e análises de dados' },
    { id: 'users', name: 'Usuários', description: 'Gerenciamento de usuários do sistema' },
    { id: 'settings', name: 'Configurações', description: 'Configurações gerais do sistema' },
  ];

  // Permissões iniciais
  const initialMatrix: PermissionMatrix = {
    developer: {
      turbo_form: ['read', 'write', 'delete', 'manage'],
      leads: ['read', 'write', 'delete', 'manage'],
      reports: ['read', 'write', 'delete', 'manage'],
      users: ['read', 'write', 'delete', 'manage'],
      settings: ['read', 'write', 'delete', 'manage'],
    },
    organizer: {
      turbo_form: ['read'],
      leads: ['read'],
      reports: ['read', 'write'],
      users: ['read'],
      settings: ['read'],
    },
    admin: {
      turbo_form: ['read', 'write', 'manage'],
      leads: ['read', 'write', 'delete'],
      reports: ['read', 'write'],
      users: ['read', 'write'],
      settings: ['read', 'write'],
    },
    interviewer: {
      turbo_form: ['read', 'write'],
      leads: ['read', 'write'],
      reports: [],
      users: [],
      settings: [],
    },
  };

  const [matrix, setMatrix] = useState<PermissionMatrix>(initialMatrix);
  const roles: UserRole[] = ['developer', 'organizer', 'admin', 'interviewer'];
  const permissions: Permission[] = ['read', 'write', 'delete', 'manage'];

  // Verifica se uma permissão está ativa
  const hasPermission = (role: UserRole, resourceId: string, permission: Permission): boolean => {
    return matrix[role][resourceId]?.includes(permission) || false;
  };

  // Alterna uma permissão
  const togglePermission = (role: UserRole, resourceId: string, permission: Permission) => {
    const newMatrix = { ...matrix };
    
    if (hasPermission(role, resourceId, permission)) {
      // Remove a permissão
      newMatrix[role][resourceId] = newMatrix[role][resourceId].filter(p => p !== permission);
    } else {
      // Adiciona a permissão
      if (!newMatrix[role][resourceId]) {
        newMatrix[role][resourceId] = [];
      }
      newMatrix[role][resourceId] = [...newMatrix[role][resourceId], permission];
    }
    
    setMatrix(newMatrix);
  };

  // Salva as alterações
  const handleSave = () => {
    if (onSave) {
      onSave(matrix);
    }
    
    toast({
      title: 'Matriz de permissões salva',
      description: 'As permissões foram atualizadas com sucesso.',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
        <CardDescription>
          Configure as permissões de acesso para cada tipo de usuário no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Recurso</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center">
                    {role === 'developer' ? 'Desenvolvedor' : 
                     role === 'organizer' ? 'Organizador' : 
                     role === 'admin' ? 'Administrador' : 
                     'Entrevistador'}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{resource.name}</div>
                      <div className="text-xs text-muted-foreground">{resource.description}</div>
                    </div>
                  </TableCell>
                  
                  {roles.map(role => (
                    <TableCell key={role} className="text-center">
                      <div className="flex flex-col gap-2">
                        {permissions.map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${role}-${resource.id}-${permission}`}
                              checked={hasPermission(role, resource.id, permission)}
                              onCheckedChange={() => togglePermission(role, resource.id, permission)}
                              disabled={role === 'developer'} // Desenvolvedor sempre tem todas as permissões
                            />
                            <label
                              htmlFor={`${role}-${resource.id}-${permission}`}
                              className="text-xs cursor-pointer"
                            >
                              {permission === 'read' ? 'Visualizar' : 
                               permission === 'write' ? 'Editar' : 
                               permission === 'delete' ? 'Excluir' : 
                               'Gerenciar'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Permissões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionMatrix;