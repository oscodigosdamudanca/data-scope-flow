import React, { useState } from 'react';
import { Users, Calendar, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CandidatesManager } from '@/features/interviews/components/CandidatesManager';
import { InterviewsManager } from '@/features/interviews/components/InterviewsManager';
import { useCandidates } from '@/features/interviews/hooks/useCandidates';
import { useInterviews } from '@/features/interviews/hooks/useInterviews';

export const InterviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const { data: candidatesStats } = useCandidates().getStats();
  const { data: interviewsStats } = useInterviews().getStats();

  const statsCards = [
    {
      title: 'Total de Candidatos',
      value: candidatesStats?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Candidatos Ativos',
      value: candidatesStats?.active || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Entrevistas Agendadas',
      value: interviewsStats?.scheduled || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Entrevistas Concluídas',
      value: interviewsStats?.completed || 0,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Entrevistas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie candidatos, agende entrevistas e acompanhe o processo seletivo
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visão Geral do Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidatos por Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Candidatos por Status</h3>
              <div className="space-y-3">
                {candidatesStats?.by_status && Object.entries(candidatesStats.by_status).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entrevistas por Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Entrevistas por Status</h3>
              <div className="space-y-3">
                {interviewsStats?.by_status && Object.entries(interviewsStats.by_status).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="candidates" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Candidatos
                </TabsTrigger>
                <TabsTrigger value="interviews" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Entrevistas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="candidates" className="p-6 mt-0">
              <CandidatesManager />
            </TabsContent>

            <TabsContent value="interviews" className="p-6 mt-0">
              <InterviewsManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveTab('candidates')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span>Adicionar Candidato</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('interviews')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Agendar Entrevista</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              disabled
            >
              <BarChart3 className="h-6 w-6" />
              <span>Relatórios</span>
              <Badge variant="secondary" className="text-xs">Em breve</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400">
              As atividades recentes aparecerão aqui quando você começar a usar o sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewsPage;