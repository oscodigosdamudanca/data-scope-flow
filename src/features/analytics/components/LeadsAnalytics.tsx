import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { AnalyticsData, DateRange } from '../hooks/useAnalytics';
import { BIConfig } from '../hooks/useBIConfig';

interface LeadsAnalyticsProps {
  companyId: string;
  analyticsData?: AnalyticsData;
  biConfig?: BIConfig;
  loading: boolean;
  dateRange?: DateRange;
}

const LeadsAnalytics: React.FC<LeadsAnalyticsProps> = ({
  companyId,
  analyticsData,
  biConfig,
  loading,
  dateRange
}) => {
  const [selectedMetric, setSelectedMetric] = useState('status');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const {
    totalLeads = 0,
    newLeads = 0,
    conversionRate = 0,
    leadsByStatus = {},
    leadsBySource = {},
    leadsByInterest = {},
    leadsByLocation = {},
    leadsTimeline = [],
    topPerformingContent = [],
    recentLeads = []
  } = analyticsData || {};

  // Métricas de leads
  const leadsMetrics = [
    {
      title: 'Total de Leads',
      value: totalLeads.toLocaleString(),
      change: newLeads > 0 ? ((newLeads / totalLeads) * 100) : 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Novos Leads (Período)',
      value: newLeads.toLocaleString(),
      change: 15.3,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionRate > 15 ? 8.2 : -3.1,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Dados para gráficos
  const statusData = Object.entries(leadsByStatus).map(([status, count]) => ({
    name: status,
    value: count as number,
    percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
  }));

  const sourceData = Object.entries(leadsBySource).map(([source, count]) => ({
    name: source,
    value: count as number,
    percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
  }));

  const interestData = Object.entries(leadsByInterest).map(([interest, count]) => ({
    name: interest,
    value: count as number,
    percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'novo': 'bg-blue-500',
      'contatado': 'bg-yellow-500',
      'qualificado': 'bg-green-500',
      'perdido': 'bg-red-500',
      'convertido': 'bg-purple-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-500';
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'novo': 'default',
      'contatado': 'secondary',
      'qualificado': 'default',
      'perdido': 'destructive',
      'convertido': 'default'
    };
    return variants[status.toLowerCase()] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leadsMetrics.map((metric, index) => {
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controles de Visualização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
          <TabsList>
            <TabsTrigger value="status">Por Status</TabsTrigger>
            <TabsTrigger value="source">Por Origem</TabsTrigger>
            <TabsTrigger value="interest">Por Interesse</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Gráfico
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Tabela
          </Button>
        </div>
      </div>

      {/* Análises por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {selectedMetric === 'status' && 'Leads por Status'}
              {selectedMetric === 'source' && 'Leads por Origem'}
              {selectedMetric === 'interest' && 'Leads por Interesse'}
              {selectedMetric === 'timeline' && 'Timeline de Leads'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetric === 'status' && (
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
            )}
            
            {selectedMetric === 'source' && (
              <div className="space-y-4">
                {sourceData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.name}</span>
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
            )}
            
            {selectedMetric === 'interest' && (
              <div className="space-y-3">
                {interestData.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedMetric === 'timeline' && (
              <div className="space-y-4">
                {leadsTimeline.length > 0 ? (
                  leadsTimeline.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-l-2 border-primary/20">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.count} leads capturados
                        </div>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Dados de timeline não disponíveis
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Leads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.length > 0 ? (
                recentLeads.slice(0, 8).map((lead, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{lead.name}</span>
                        <Badge 
                          variant={getStatusBadgeVariant(lead.status)}
                          className="text-xs"
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.interest && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {lead.interest}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(lead.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum lead recente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {((Array.isArray(leadsByStatus) ? leadsByStatus.reduce((sum, status) => sum + status.count, 0) : 0) / Math.max(totalLeads, 1) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Ativação</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(totalLeads / 30)}
              </div>
              <div className="text-sm text-muted-foreground">Leads/Dia (Média)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {interestData.length}
              </div>
              <div className="text-sm text-muted-foreground">Interesses Únicos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsAnalytics;