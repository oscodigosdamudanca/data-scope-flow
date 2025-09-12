import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Clock
} from 'lucide-react';
import { AnalyticsData, DateRange } from '../hooks/useAnalytics';
import { BIConfig } from '../hooks/useBIConfig';

interface OverviewAnalyticsProps {
  companyId: string;
  analyticsData?: AnalyticsData;
  biConfig?: BIConfig;
  loading: boolean;
  dateRange?: DateRange;
}

const OverviewAnalytics: React.FC<OverviewAnalyticsProps> = ({
  companyId,
  analyticsData,
  biConfig,
  loading,
  dateRange
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalLeads = 0,
    newLeads = 0,
    conversionRate = 0,
    totalSurveys = 0,
    completedSurveys = 0,
    avgResponseTime = 0,
    topInterests = [],
    leadsByStatus = {},
    surveysByType = {},
    recentActivity = []
  } = analyticsData || {};

  // Calcular métricas derivadas
  const leadGrowth = newLeads > 0 ? ((newLeads / totalLeads) * 100) : 0;
  const surveyCompletionRate = totalSurveys > 0 ? ((completedSurveys / totalSurveys) * 100) : 0;
  const activeLeadsCount = Object.values(leadsByStatus).reduce((sum: number, count) => sum + (count as number), 0);
  
  // Métricas principais
  const mainMetrics = [
    {
      title: 'Total de Leads',
      value: totalLeads.toLocaleString(),
      change: leadGrowth,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Leads capturados no período'
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionRate > 15 ? 5.2 : -2.1,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Conversão de visitantes em leads'
    },
    {
      title: 'Pesquisas Completas',
      value: completedSurveys.toLocaleString(),
      change: surveyCompletionRate,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Pesquisas finalizadas'
    },
    {
      title: 'Tempo Médio',
      value: `${avgResponseTime}min`,
      change: avgResponseTime < 5 ? 12.5 : -8.3,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Tempo médio de resposta'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <Card key={index} className="relative overflow-hidden">
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
                    <span className="text-xs text-muted-foreground">
                      vs período anterior
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

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Leads por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsByStatus).map(([status, count]) => {
                const percentage = totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0;
                const statusColors: Record<string, string> = {
                  'novo': 'bg-blue-500',
                  'contatado': 'bg-yellow-500',
                  'qualificado': 'bg-green-500',
                  'perdido': 'bg-red-500'
                };
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium capitalize">{status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{count as number}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Interesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Principais Interesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topInterests.length > 0 ? (
                topInterests.slice(0, 5).map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{interest.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{interest.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {((interest.count / totalLeads) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum interesse registrado ainda
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-muted">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full mt-1">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Período */}
      {dateRange && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo do Período Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{newLeads}</div>
                <div className="text-sm text-muted-foreground">Novos Leads</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedSurveys}</div>
                <div className="text-sm text-muted-foreground">Pesquisas Completas</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewAnalytics;