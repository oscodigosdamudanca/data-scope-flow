import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings, 
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAnalytics, DateRange } from '../hooks/useAnalytics';
import { useBIConfig } from '../hooks/useBIConfig';
import { useAuth } from '@/contexts/AuthContext';
import LeadsAnalytics from './LeadsAnalytics';
import SurveysAnalytics from './SurveysAnalytics';
import OverviewAnalytics from './OverviewAnalytics';
import DashboardSettings from './DashboardSettings';

interface ExhibitorDashboardProps {
  companyId: string;
  companyName?: string;
}

const ExhibitorDashboard: React.FC<ExhibitorDashboardProps> = ({ 
  companyId, 
  companyName 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refetch 
  } = useAnalytics(companyId, dateRange);

  const { 
    config: biConfig, 
    loading: configLoading,
    error: configError 
  } = useBIConfig(companyId, activeTab);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Implementar exportação de dados
    console.log('Exportando dados...', { companyId, activeTab, dateRange });
  };

  const isLoading = analyticsLoading || configLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Analytics - {companyName || 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Painel de Business Intelligence para análise de dados e métricas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            Dados atualizados em tempo real
          </span>
        </div>
        
        {autoRefresh && (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Atualização automática ativa
            </span>
          </div>
        )}
        
        {dateRange && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filtro de período ativo
            </span>
          </div>
        )}
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pesquisas
          </TabsTrigger>
          <TabsTrigger value="raffles" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sorteios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewAnalytics 
            companyId={companyId}
            analyticsData={analyticsData}
            biConfig={biConfig}
            loading={isLoading}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <LeadsAnalytics 
            companyId={companyId}
            analyticsData={analyticsData}
            biConfig={biConfig}
            loading={isLoading}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <SurveysAnalytics 
            companyId={companyId}
            analyticsData={analyticsData}
            biConfig={biConfig}
            loading={isLoading}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="raffles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics de Sorteios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O módulo de analytics para sorteios será implementado em breve.
                </p>
                <Badge variant="secondary" className="mt-4">
                  Próxima Fase
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardSettings 
              companyId={companyId}
              dashboardType={activeTab}
              biConfig={biConfig}
              onClose={() => setShowSettings(false)}
              onAutoRefreshChange={setAutoRefresh}
              onDateRangeChange={setDateRange}
            />
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <div>
                <h3 className="font-semibold">Carregando dados...</h3>
                <p className="text-sm text-muted-foreground">
                  Processando informações do dashboard
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExhibitorDashboard;