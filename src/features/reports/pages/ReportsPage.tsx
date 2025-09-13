import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// DatePicker será implementado com Popover + Calendar
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Search,
  Settings,
  Eye,
  Share2,
  Bookmark
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { ChartContainer } from '../components/ChartContainer';
import { MetricCard } from '../components/MetricCard';
import { ReportFilters } from '../components/ReportFilters';
import { ExportDialog } from '../components/ExportDialog';
// import { ReportBuilder } from '../components/ReportBuilder';
// import { SavedReports } from '../components/SavedReports';

interface DateRange {
  from: Date;
  to: Date;
}

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    source: 'all',
    status: 'all',
    category: 'all'
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  const { data: analyticsData, loading, refetch } = useAnalytics();

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Métricas principais para o período selecionado
  const mainMetrics = [
    {
      title: 'Total de Leads',
      value: analyticsData?.totalLeads || 0,
      change: 12.5,
      icon: Users,
      color: 'blue',
      description: 'Leads capturados no período'
    },
    {
      title: 'Taxa de Conversão',
      value: `${analyticsData?.conversionRate || 0}%`,
      change: 8.3,
      icon: TrendingUp,
      color: 'green',
      description: 'Conversão de leads para oportunidades'
    },
    {
      title: 'Pesquisas Ativas',
      value: analyticsData?.totalSurveys || 0,
      change: -2.1,
      icon: FileText,
      color: 'purple',
      description: 'Pesquisas em andamento'
    },
    {
      title: 'Taxa de Resposta',
      value: `${analyticsData?.completionRate || 0}%`,
      change: 15.7,
      icon: BarChart3,
      color: 'orange',
      description: 'Taxa de conclusão das pesquisas'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackToDashboard variant="outline" position="header" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Relatórios Avançados</h1>
              <p className="text-muted-foreground">
                Análises detalhadas, gráficos interativos e exportação personalizada
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setShowReportBuilder(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Criar Relatório
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <ReportFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              color={metric.color as const}
              description={metric.description}
              loading={loading}
            />
          ))}
        </div>

        {/* Conteúdo Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="surveys">Pesquisas</TabsTrigger>
            <TabsTrigger value="custom">Personalizados</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Leads por Período */}
              <ChartContainer
                title="Evolução de Leads"
                description="Leads capturados ao longo do tempo"
                type="line"
                data={analyticsData?.dailyLeads || []}
                loading={loading}
              />

              {/* Gráfico de Fontes */}
              <ChartContainer
                title="Principais Fontes"
                description="Distribuição de leads por fonte"
                type="pie"
                data={analyticsData?.topSources || []}
                loading={loading}
              />

              {/* Gráfico de Status */}
              <ChartContainer
                title="Status dos Leads"
                description="Distribuição por status atual"
                type="bar"
                data={analyticsData?.leadsByStatus || []}
                loading={loading}
              />

              {/* Gráfico de Pesquisas */}
              <ChartContainer
                title="Performance das Pesquisas"
                description="Taxa de conclusão por pesquisa"
                type="bar"
                data={analyticsData?.surveysByType || []}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análise Detalhada de Leads */}
              <ChartContainer
                title="Leads por Interesse"
                description="Distribuição por área de interesse"
                type="doughnut"
                data={analyticsData?.leadsByInterest || []}
                loading={loading}
              />

              <ChartContainer
                title="Tendência Semanal"
                description="Leads capturados por semana"
                type="area"
                data={analyticsData?.weeklyLeads || []}
                loading={loading}
              />

              <ChartContainer
                title="Análise Mensal"
                description="Performance mensal de captação"
                type="column"
                data={analyticsData?.monthlyLeads || []}
                loading={loading}
              />

              <ChartContainer
                title="Funil de Conversão"
                description="Jornada do lead até conversão"
                type="funnel"
                data={[
                  { name: 'Visitantes', value: 1000 },
                  { name: 'Leads', value: 250 },
                  { name: 'Qualificados', value: 100 },
                  { name: 'Oportunidades', value: 50 },
                  { name: 'Conversões', value: 15 }
                ]}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="surveys" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análise de Pesquisas */}
              <ChartContainer
                title="Respostas por Pergunta"
                description="Número de respostas por pergunta"
                type="bar"
                data={analyticsData?.responsesByQuestion || []}
                loading={loading}
              />

              <ChartContainer
                title="Avaliações Recebidas"
                description="Distribuição das avaliações"
                type="pie"
                data={analyticsData?.surveyRatings || []}
                loading={loading}
              />

              <ChartContainer
                title="Taxa de Abandono"
                description="Abandono por etapa da pesquisa"
                type="line"
                data={[
                  { name: 'Início', value: 100 },
                  { name: 'Meio', value: 85 },
                  { name: 'Final', value: 70 }
                ]}
                loading={loading}
              />

              <ChartContainer
                title="Tempo de Resposta"
                description="Tempo médio por pesquisa"
                type="column"
                data={[
                  { name: 'Pesquisa A', value: 5.2 },
                  { name: 'Pesquisa B', value: 3.8 },
                  { name: 'Pesquisa C', value: 7.1 }
                ]}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Construtor de Relatórios</CardTitle>
              <CardDescription>
                Crie relatórios personalizados com suas próprias métricas e visualizações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Construtor de relatórios em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Salvos</CardTitle>
              <CardDescription>
                Acesse seus relatórios salvos e configurações personalizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório salvo encontrado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

      {/* Dialogs */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={analyticsData}
        dateRange={dateRange}
        filters={filters}
      />

      {/* ReportBuilder component temporarily disabled */}
    </MainLayout>
  );
};

export default ReportsPage;