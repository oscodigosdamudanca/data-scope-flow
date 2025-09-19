import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PermissionMatrix from '../components/PermissionMatrix';

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
  
  // Carregar permissões do localStorage (solução temporária)
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        
        // Tentar carregar do localStorage primeiro (solução temporária)
        const savedPermissions = localStorage.getItem('module_permissions');
        if (savedPermissions) {
          const permissionsData = JSON.parse(savedPermissions);
          const loadedPermissions = {};
          
          permissionsData.forEach(perm => {
            if (!loadedPermissions[perm.role_name]) {
              loadedPermissions[perm.role_name] = [];
            }
            if (perm.is_active) {
              loadedPermissions[perm.role_name].push(perm.module_name);
            }
          });
          
          setPermissions(loadedPermissions);
          console.log('Permissões carregadas do localStorage:', loadedPermissions);
          return;
        }
        
        // Se não houver dados no localStorage, usar permissões padrão
        setPermissions(defaultPermissions);
        console.log('Usando permissões padrão:', defaultPermissions);
        
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        // Em caso de erro, usar permissões padrão
        setPermissions(defaultPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);
  
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
      
      console.log('Salvando permissões:', permissionsToSave);
      
      // Como a tabela module_permissions não existe, vamos usar localStorage temporariamente
      // e mostrar uma mensagem informativa ao usuário
      localStorage.setItem('module_permissions', JSON.stringify(permissionsToSave));
      
      toast({
        title: "Permissões salvas localmente",
        description: "As permissões foram salvas no navegador. A tabela do banco será criada em breve.",
        variant: "default",
      });
      
      console.log('Permissões salvas no localStorage:', permissionsToSave);
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
  
  // Adicionando suporte para o componente PermissionMatrix
  const handleSavePermissionsMatrix = (matrix) => {
    setPermissions(matrix);
    savePermissions();
  };
  
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
            <p className="text-muted-foreground">Configure as permissões de acesso para cada tipo de usuário</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/developer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Nova matriz de permissões */}
          <PermissionMatrix onSave={handleSavePermissionsMatrix} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PermissionsPage;