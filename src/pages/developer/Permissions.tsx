import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/core';
import { Shield, Plus, Edit, Trash2, Users, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Permissions = () => {
  const modules = [
    {
      id: 1,
      name: 'Captação de Leads',
      description: 'Gerenciamento de leads e prospects',
      permissions: {
        developer: ['create', 'read', 'update', 'delete', 'admin'],
        organizer: ['read'],
        admin: ['create', 'read', 'update', 'delete'],
        interviewer: []
      }
    },
    {
      id: 2,
      name: 'Sorteios',
      description: 'Gerenciamento de sorteios e premiações',
      permissions: {
        developer: ['create', 'read', 'update', 'delete', 'admin'],
        organizer: ['read'],
        admin: ['create', 'read', 'update', 'delete'],
        interviewer: []
      }
    },
    {
      id: 3,
      name: 'Analytics',
      description: 'Sistema de análises e relatórios',
      permissions: {
        developer: ['create', 'read', 'update', 'delete', 'admin'],
        organizer: ['read'],
        admin: ['read'],
        interviewer: []
      }
    },
    {
      id: 4,
      name: 'Feedback da Feira',
      description: 'Coleta de feedback sobre eventos',
      permissions: {
        developer: ['create', 'read', 'update', 'delete', 'admin'],
        organizer: ['create', 'read', 'update', 'delete'],
        admin: [],
        interviewer: []
      }
    },
    {
      id: 5,
      name: 'Pesquisas Personalizadas',
      description: 'Criação de pesquisas customizadas',
      permissions: {
        developer: ['create', 'read', 'update', 'delete', 'admin'],
        organizer: ['create', 'read', 'update', 'delete'],
        admin: [],
        interviewer: []
      }
    }
  ];

  const roleLabels = {
    developer: 'Desenvolvedor',
    organizer: 'Organizador da Feira',
    admin: 'Administrador',
    interviewer: 'Entrevistador'
  };

  const permissionLabels = {
    create: 'Criar',
    read: 'Visualizar',
    update: 'Editar',
    delete: 'Excluir',
    admin: 'Administrar'
  };

  const getPermissionColor = (permission: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (permission) {
      case 'admin': return 'destructive';
      case 'delete': return 'destructive';
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'read': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissões do Sistema</h1>
            <p className="text-muted-foreground">
              Configure as permissões de acesso por módulo e role de usuário
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Permissão
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Módulos
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">
              Módulos configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roles de Usuário
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(roleLabels).length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de usuário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Permissões
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(permissionLabels).length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de permissão
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(module.permissions).map(([role, permissions]) => (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{roleLabels[role as keyof typeof roleLabels]}</Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {permissions.length > 0 ? (
                        permissions.map((permission) => (
                          <Badge 
                            key={permission} 
                            variant={getPermissionColor(permission)}
                            className="text-xs"
                          >
                            {permissionLabels[permission as keyof typeof permissionLabels]}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem permissões</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Permissions;