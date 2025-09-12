import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Star,
  MessageSquare,
  Activity,
  Award
} from 'lucide-react';
import { AnalyticsData, DateRange } from '../hooks/useAnalytics';
import { BIConfig } from '../hooks/useBIConfig';

interface SurveysAnalyticsProps {
  companyId: string;
  analyticsData?: AnalyticsData;
  biConfig?: BIConfig;
  loading: boolean;
  dateRange?: DateRange;
}

const SurveysAnalytics: React.FC<SurveysAnalyticsProps> = ({
  companyId,
  analyticsData,
  biConfig,
  loading,
  dateRange
}) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const {
    totalSurveys = 0,
    completedSurveys = 0,
    avgResponseTime = 0,
    surveysByType = {},
    surveysByStatus = {},
    responsesByQuestion = {},
    surveyRatings = {},
    recentSurveys = [],
    topPerformingSurveys = [],
    abandonmentRate = 0
  } = analyticsData || {};

  // Calcular métricas derivadas
  const completionRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0;
  const activeRate = 100 - abandonmentRate;
  const avgRating = Object.values(surveyRatings).length > 0 
    ? Object.values(surveyRatings).reduce((sum: number, rating) => sum + (rating as number), 0) / Object.values(surveyRatings).length 
    : 0;

  // Métricas principais
  const surveyMetrics = [
    {
      title: 'Total de Pesquisas',
      value: totalSurveys.toLocaleString(),
      change: 12.5,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Pesquisas criadas'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionRate.toFixed(1)}%`,
      change: completionRate > 70 ? 8.3 : -5.2,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Pesquisas finalizadas'
    },
    {
      title: 'Tempo Médio',
      value: `${avgResponseTime}min`,
      change: avgResponseTime < 5 ? 15.7 : -10.2,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Tempo de resposta'
    },
    {
      title: 'Avaliação Média',
      value: avgRating.toFixed(1),
      change: avgRating > 4 ? 6.8 : -3.4,
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Satisfação geral'
    }
  ];

  // Dados para gráficos
  const typeData = Object.entries(surveysByType).map(([type, count]) => ({
    name: type,
    value: count as number,
    percentage: totalSurveys > 0 ? ((count as number) / totalSurveys) * 100 : 0
  }));

  const statusData = Object.entries(surveysByStatus).map(([status, count]) => ({
    name: status,
    value: count as number,
    percentage: totalSurveys > 0 ? ((count as number) / totalSurveys) * 100 : 0
  }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ativo': 'bg-green-500',
      'rascunho': 'bg-yellow-500',
      'pausado': 'bg-orange-500',
      'finalizado': 'bg-blue-500',
      'arquivado': 'bg-gray-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'satisfacao': Star,
      'feedback': MessageSquare,
      'avaliacao': Target,
      'pesquisa': FileText,
      'questionario': BarChart3
    };
    return icons[type.toLowerCase()] || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {surveyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controles de Visualização */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pesquisas por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Pesquisas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeData.map((item, index) => {
                    const TypeIcon = getTypeIcon(item.name);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium capitalize">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{item.value}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status das Pesquisas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status das Pesquisas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.name)}`}></div>
                          <span className="text-sm font-medium capitalize">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{item.value}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pesquisas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Pesquisas com Melhor Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformingSurveys.length > 0 ? (
                    topPerformingSurveys.slice(0, 5).map((survey, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                            <span className="text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{survey.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {survey.responses} respostas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {survey.completionRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            conclusão
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma pesquisa com dados de performance
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Engajamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Taxa de Conclusão</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {completionRate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Taxa de Atividade</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {activeRate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Taxa de Abandono</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {abandonmentRate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Avaliação Média</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {avgRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Análise de Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(responsesByQuestion).length > 0 ? (
                  Object.entries(responsesByQuestion).map(([question, responses], index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">{question}</h4>
                      <div className="space-y-2">
                        {Object.entries(responses as Record<string, number>).map(([answer, count]) => {
                          const total = Object.values(responses as Record<string, number>).reduce((sum, c) => sum + c, 0);
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          
                          return (
                            <div key={answer} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{answer}</span>
                                <span className="font-medium">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma resposta disponível para análise
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pesquisas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pesquisas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSurveys.length > 0 ? (
                    recentSurveys.slice(0, 6).map((survey, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{survey.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {survey.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Tipo: {survey.type}</div>
                            <div>Respostas: {survey.responses}</div>
                            <div>Criado: {new Date(survey.created_at).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma pesquisa recente
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Estatístico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumo Estatístico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalSurveys}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedSurveys}</div>
                    <div className="text-sm text-muted-foreground">Completas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{avgResponseTime}min</div>
                    <div className="text-sm text-muted-foreground">Tempo Médio</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{avgRating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Avaliação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveysAnalytics;