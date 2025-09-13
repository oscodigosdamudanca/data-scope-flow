import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, FileText, BarChart3, UserPlus, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '../hooks/useLeads';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads } = useLeads();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Calcular estatísticas
  const totalLeads = leads.length;
  const activeLeads = leads.filter(lead => ['new', 'contacted', 'qualified'].includes(lead.status)).length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  // Leads do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const leadsThisMonth = leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
  }).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <BackToDashboard />
        
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sistema de Leads
              </h1>
              <p className="text-gray-600">
                Gerencie e acompanhe seus leads de forma eficiente
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/leads/capture')}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Novo Lead
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/leads/list')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Ver Todos
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Leads Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '...' : activeLeads}
              </div>
              <p className="text-sm text-muted-foreground">
                Leads em acompanhamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {loading ? '...' : `${conversionRate}%`}
              </div>
              <p className="text-sm text-muted-foreground">
                Taxa de conversão geral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Novos Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? '...' : leadsThisMonth}
              </div>
              <p className="text-sm text-muted-foreground">
                Leads captados este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leads/create')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Criar Novo Lead
              </CardTitle>
              <CardDescription>
                Adicione um novo lead ao seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Criação Rápida</Badge>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Lead
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leads/capture')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Capturar Novo Lead
              </CardTitle>
              <CardDescription>
                Adicione um novo lead ao sistema com informações completas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Formulário Completo</Badge>
                  <Badge variant="outline">Validação LGPD</Badge>
                </div>
                <Button size="sm">
                  Começar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leads/list')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Gerenciar Leads
              </CardTitle>
              <CardDescription>
                Visualize, edite e acompanhe todos os seus leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-green-600">✓ Disponível</Badge>
                  <Badge variant="secondary">Filtros Avançados</Badge>
                </div>
                <Button size="sm" onClick={() => navigate('/leads/list')}>
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Management Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leads/tags')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Gerenciar Tags
              </CardTitle>
              <CardDescription>
                Crie e organize tags para categorizar seus leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-orange-600">✓ Disponível</Badge>
                  <Badge variant="secondary">Sistema Completo</Badge>
                </div>
                <Button size="sm">
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leads/tagging')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Aplicar Tags
              </CardTitle>
              <CardDescription>
                Aplique tags aos seus leads existentes em lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-indigo-600">✓ Disponível</Badge>
                  <Badge variant="secondary">Ação em Lote</Badge>
                </div>
                <Button size="sm">
                  Começar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Status de Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de Leads em Construção
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Estamos desenvolvendo uma solução completa para captação, 
                qualificação e acompanhamento de leads. O formulário de captação já está disponível!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="default" className="bg-green-600">
                  ✓ Estrutura do Banco
                </Badge>
                <Badge variant="default" className="bg-green-600">
                  ✓ Interfaces TypeScript
                </Badge>
                <Badge variant="default" className="bg-green-600">
                  ✓ Formulário de Captação
                </Badge>
                <Badge variant="default" className="bg-green-600">
                  ✓ Listagem de Leads
                </Badge>
                <Badge variant="outline">
                  ⏳ Analytics Avançados
                </Badge>
                <Badge variant="outline">
                  ⏳ Integração com Surveys
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LeadsPage;