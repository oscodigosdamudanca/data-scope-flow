import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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

// Matriz de permissões (role x módulo)
const permissions = {
  developer: ['dashboard', 'leads', 'surveys', 'raffles', 'fair_feedback', 'custom_surveys', 'analytics', 'admin', 'developer'],
  organizer: ['dashboard', 'leads', 'surveys', 'raffles', 'fair_feedback', 'custom_surveys', 'analytics'],
  admin: ['dashboard', 'leads', 'surveys', 'raffles', 'analytics', 'admin'],
  interviewer: ['dashboard', 'leads']
};

const PermissionsPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matriz de Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Módulo</TableHead>
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
                        <div className="text-xs text-muted-foreground">{module.description}</div>
                      </div>
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={role.id} className="text-center">
                        <Checkbox 
                          checked={permissions[role.id].includes(module.id)}
                          className="mx-auto"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PermissionsPage;