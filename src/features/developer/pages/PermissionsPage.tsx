import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const roles = [
  { id: 'developer', name: 'Desenvolvedor' },
  { id: 'organizer', name: 'Organizador da Feira' },
  { id: 'admin', name: 'Administrador (Expositor)' },
  { id: 'interviewer', name: 'Entrevistador' }
];

const modules = [
  { id: 'dashboard', name: 'Dashboard', description: 'Acesso ao painel principal' },
  { id: 'leads', name: 'Captação de Leads', description: 'Gerenciamento de leads e formulários' },
  { id: 'surveys', name: 'Pesquisas', description: 'Criação e gerenciamento de pesquisas' },
  { id: 'raffles', name: 'Sorteios', description: 'Configuração e execução de sorteios' },
  { id: 'fair_feedback', name: 'Feedback da Feira', description: 'Coleta de feedback dos expositores' },
  { id: 'custom_surveys', name: 'Pesquisas Personalizadas', description: 'Criação de pesquisas customizadas' },
  { id: 'analytics', name: 'Analytics', description: 'Visualização de relatórios e métricas' },
  { id: 'admin', name: 'Administração', description: 'Configurações administrativas' },
  { id: 'developer', name: 'Área do Desenvolvedor', description: 'Configurações avançadas do sistema' }
];

// Matriz de permissões inicial (role x módulo)
const defaultPermissions = {
  developer: ['dashboard', 'leads', 'surveys', 'raffles', 'fair_feedback', 'custom_surveys', 'analytics', 'admin', 'developer'],
  organizer: ['dashboard', 'leads', 'surveys', 'raffles', 'fair_feedback', 'custom_surveys', 'analytics'],
  admin: ['dashboard', 'leads', 'surveys', 'raffles', 'analytics', 'admin'],
  interviewer: ['dashboard', 'leads']
};

const PermissionsPage = () => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar permissões do banco de dados
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('role_type', 'app_role');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Transformar os dados do banco para o formato da interface
          const dbPermissions = {};
          
          roles.forEach(role => {
            dbPermissions[role.id] = [];
          });
          
          data.forEach(permission => {
            const roleId = permission.role_name;
            const moduleId = permission.module_name;
            const isActive = permission.is_active;
            
            if (isActive && dbPermissions[roleId] && !dbPermissions[roleId].includes(moduleId)) {
              dbPermissions[roleId].push(moduleId);
            }
          });
          
          setPermissions(dbPermissions);
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        toast({
          title: 'Erro ao carregar permissões',
          description: 'Não foi possível carregar as permissões do banco de dados.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPermissions();
  }, [toast]);
  
  const handlePermissionChange = (roleId, moduleId, isChecked) => {
    setPermissions(prevPermissions => {
      const updatedPermissions = { ...prevPermissions };
      
      if (isChecked) {
        // Adicionar permissão
        if (!updatedPermissions[roleId].includes(moduleId)) {
          updatedPermissions[roleId] = [...updatedPermissions[roleId], moduleId];
        }
      } else {
        // Remover permissão
        updatedPermissions[roleId] = updatedPermissions[roleId].filter(id => id !== moduleId);
      }
      
      return updatedPermissions;
    });
  };
  
  const savePermissions = async () => {
    try {
      setIsSaving(true);
      
      // Preparar os dados para salvar no banco
      const permissionsToSave = [];
      
      roles.forEach(role => {
        modules.forEach(module => {
          const isActive = permissions[role.id]?.includes(module.id) || false;
          
          permissionsToSave.push({
            role_type: 'app_role',
            role_name: role.id,
            module_name: module.id,
            is_active: isActive,
            updated_at: new Date().toISOString()
          });
        });
      });
      
      // Primeiro, excluir todas as permissões existentes
      const { error: deleteError } = await supabase
        .from('module_permissions')
        .delete()
        .eq('role_type', 'app_role');
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Inserir as novas permissões
      const { error: insertError } = await supabase
        .from('module_permissions')
        .insert(permissionsToSave);
      
      if (insertError) {
        throw insertError;
      }
      
      toast({
        title: 'Permissões salvas',
        description: 'As permissões foram atualizadas com sucesso.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        title: 'Erro ao salvar permissões',
        description: 'Não foi possível salvar as permissões no banco de dados.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveChanges = () => {
    savePermissions();
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link to="/developer">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
          </div>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando permissões...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Módulo</TableHead>
                    {roles.map(role => (
                      <TableHead key={role.id} className="text-center">{role.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map(module => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{module.name}</div>
                          <div className="text-sm text-muted-foreground">{module.description}</div>
                        </div>
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role.id} className="text-center">
                          <Checkbox
                            checked={permissions[role.id]?.includes(module.id) || false}
                            onCheckedChange={(checked) => handlePermissionChange(role.id, module.id, checked)}
                            aria-label={`Permissão de ${role.name} para ${module.name}`}
                            disabled={isLoading || isSaving}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PermissionsPage;