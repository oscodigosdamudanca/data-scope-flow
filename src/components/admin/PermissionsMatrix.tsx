import React, { useState, useEffect } from 'react';
import { useUserPermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermissionsMatrixProps {
  userId: string;
  userName?: string;
  userRole?: string;
}

// Definição dos módulos e suas permissões
const MODULES_PERMISSIONS = {
  'leads': {
    name: 'Captação de Leads',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'sorteios': {
    name: 'Sorteios',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'relatorios': {
    name: 'Relatórios',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'usuarios': {
    name: 'Usuários',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'configuracoes': {
    name: 'Configurações',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'pesquisas': {
    name: 'Pesquisas',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  },
  'feedback': {
    name: 'Feedback da Feira',
    permissions: ['visualizar', 'editar', 'excluir', 'gerenciar']
  }
};

export const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  userId,
  userName,
  userRole
}) => {
  const { user: currentUser } = useAuth();
  const { permissions, loading, updatePermission, checkPermission, refetch } = useUserPermissions(userId);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Verificar se o usuário atual tem permissão para gerenciar permissões
  const canManagePermissions = currentUser?.id && checkPermission('usuarios', 'gerenciar');

  const handlePermissionToggle = (module: string, permission: string, granted: boolean) => {
    const key = `${module}-${permission}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: granted
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast({
        title: 'Nenhuma alteração',
        description: 'Não há alterações pendentes para salvar.',
      });
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const [key, granted] of Object.entries(pendingChanges)) {
        const [module, permission] = key.split('-');
        const success = await updatePermission(module, permission, granted);
        
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Permissões atualizadas',
          description: `${successCount} permissão(ões) atualizada(s) com sucesso.`,
        });
        setPendingChanges({});
      }

      if (errorCount > 0) {
        toast({
          title: 'Erro parcial',
          description: `${errorCount} permissão(ões) não puderam ser atualizadas.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges({});
    toast({
      title: 'Alterações descartadas',
      description: 'Todas as alterações pendentes foram descartadas.',
    });
  };

  const refreshPermissions = async () => {
    await refetch();
    setPendingChanges({});
    toast({
      title: 'Permissões atualizadas',
      description: 'A matriz de permissões foi atualizada.',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando permissões...</span>
        </CardContent>
      </Card>
    );
  }

  if (!canManagePermissions) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Você não tem permissão para gerenciar permissões de usuários.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Matriz de Permissões</CardTitle>
            <CardDescription>
              Gerenciar permissões para {userName || 'usuário'} 
              {userRole && <Badge variant="secondary" className="ml-2">{userRole}</Badge>}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPermissions}
              disabled={saving}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            {Object.keys(pendingChanges).length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardChanges}
                  disabled={saving}
                >
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={saveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Salvar ({Object.keys(pendingChanges).length})
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(MODULES_PERMISSIONS).map(([moduleKey, moduleData]) => (
            <div key={moduleKey} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{moduleData.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moduleData.permissions.map((permission) => {
                  const key = `${moduleKey}-${permission}`;
                  const currentValue = pendingChanges[key] !== undefined 
                    ? pendingChanges[key] 
                    : checkPermission(moduleKey, permission);
                  const hasChanges = pendingChanges[key] !== undefined;

                  return (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={currentValue}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(moduleKey, permission, checked)
                        }
                        disabled={saving}
                      />
                      <label 
                        htmlFor={key} 
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          hasChanges ? 'text-orange-600 font-semibold' : ''
                        }`}
                      >
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                        {hasChanges && <span className="ml-1">*</span>}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {Object.keys(pendingChanges).length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Alterações pendentes:</strong> {Object.keys(pendingChanges).length} permissão(ões) 
              foram modificadas mas ainda não foram salvas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};