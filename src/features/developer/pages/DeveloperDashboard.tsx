import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Shield, Activity, Settings, Database } from 'lucide-react';

const DeveloperDashboard = () => {
  const developerModules = [
    {
      title: 'Tipos de Pergunta',
      description: 'Gerencie os tipos de perguntas disponíveis no sistema',
      icon: Code,
      url: '/developer/question-types',
      color: 'bg-blue-500'
    },
    {
      title: 'Permissões',
      description: 'Configure as permissões de acesso para diferentes níveis de usuário',
      icon: Shield,
      url: '/developer/permissions',
      color: 'bg-amber-500'
    },
    {
      title: 'Logs do Sistema',
      description: 'Visualize os logs de atividade e erros do sistema',
      icon: Activity,
      url: '/developer/logs',
      color: 'bg-red-500'
    },
    {
      title: 'Configurações Avançadas',
      description: 'Acesse configurações avançadas da plataforma',
      icon: Settings,
      url: '/developer/settings',
      color: 'bg-purple-500'
    },
    {
      title: 'Banco de Dados',
      description: 'Visualize e gerencie a estrutura do banco de dados',
      icon: Database,
      url: '/developer/database',
      color: 'bg-green-500'
    }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToDashboard />
            <h1 className="text-2xl font-bold">Área do Desenvolvedor</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developerModules.map((module) => (
            <Card key={module.title} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className={`${module.color} text-white`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <module.icon className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-sm mb-4">{module.description}</CardDescription>
                <Button asChild className="w-full">
                  <Link to={module.url}>Acessar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Visão geral do estado atual da aplicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Versão da Aplicação</p>
                  <p className="text-2xl font-bold">1.0.0</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Usuários Ativos</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Último Deploy</p>
                  <p className="text-2xl font-bold">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeveloperDashboard;