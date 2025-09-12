import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings, 
  Download, 
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExhibitorDashboard from '../components/ExhibitorDashboard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useBIConfig } from '../hooks/useBIConfig';

interface AnalyticsPageProps {
  // Props opcionais para customização
  defaultTab?: string;
  companyId?: string;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ 
  defaultTab = 'overview',
  companyId: propCompanyId 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Estados
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Determinar company_id
  const companyId = propCompanyId || user?.user_metadata?.company_id || searchParams.get('company_id');

  // Hooks
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useAnalytics(companyId);

  const { 
    config: biConfig, 
    loading: configLoading, 
    error: configError,
    updateConfig 
  } = useBIConfig(companyId, 'exhibitor_dashboard');

  // Efeitos
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'leads', 'surveys', 'reports'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(analyticsLoading || configLoading);
  }, [analyticsLoading, configLoading]);

  useEffect(() => {
    if (analyticsError || configError) {
      setError(analyticsError || configError || 'Erro ao carregar dados');
    } else {
      setError(null);
    }
  }, [analyticsError, configError]);

  // Handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', tab);
      return newParams;
    });
  };

  const handleRefresh = async () => {
    try {
      await refetchAnalytics();
      setLastUpdated(new Date());
    } catch (err) {
      setError('Erro ao atualizar dados');
    }
  };

  const handleExport = () => {
    // Implementar exportação
    console.log('Exportando dados...', { activeTab, companyId });
  };

  // Verificações de acesso
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Acesso Necessário</h3>
                <p className="text-sm text-muted-foreground">
                  Você precisa estar logado para acessar o painel de analytics.
                </p>
              </div>
              <Button onClick={() => navigate('/auth/login')}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Empresa Não Identificada</h3>
                <p className="text-sm text-muted-foreground">
                  Não foi possível identificar sua empresa. Verifique se você tem as permissões necessárias.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 w-full bg-muted animate-pulse rounded" />

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Erro ao Carregar Dados</h3>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Voltar
                </Button>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estatísticas rápidas para o header
  const quickStats = {
    totalLeads: analyticsData?.totalLeads || 0,
    conversionRate: analyticsData?.conversionRate || 0,
    totalSurveys: analyticsData?.totalSurveys || 0,
    completionRate: analyticsData?.completionRate || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics & BI</h1>
          <p className="text-muted-foreground">
            Painel de business intelligence para análise de dados e métricas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Atualizado: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total de Leads</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{quickStats.totalLeads}</div>
              <div className="text-xs text-muted-foreground">
                Taxa de conversão: {quickStats.conversionRate.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Pesquisas</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{quickStats.totalSurveys}</div>
              <div className="text-xs text-muted-foreground">
                Taxa de conclusão: {quickStats.completionRate.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Crescimento</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">+12.5%</div>
              <div className="text-xs text-muted-foreground">
                Comparado ao mês anterior
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Engajamento</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">87.3%</div>
              <div className="text-xs text-muted-foreground">
                Índice de satisfação
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardContent className="p-0">
          <ExhibitorDashboard 
            companyId={companyId}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/leads')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Gerenciar Leads</h3>
                <p className="text-sm text-muted-foreground">
                  Visualizar e gerenciar todos os leads capturados
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/surveys')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Pesquisas</h3>
                <p className="text-sm text-muted-foreground">
                  Criar e analisar pesquisas de satisfação
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/reports')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Relatórios</h3>
                <p className="text-sm text-muted-foreground">
                  Gerar relatórios detalhados e insights
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;