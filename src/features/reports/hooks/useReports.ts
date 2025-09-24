import { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedReports } from './useSavedReports';

interface DateRange {
  from: Date;
  to: Date;
}

interface ReportFilters {
  dateRange: DateRange;
  source?: string[];
  status?: string[];
  category?: string[];
  priority?: string[];
  searchTerm?: string;
  customFilters?: Record<string, any>;
}

interface MetricData {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: 'default' | 'success' | 'warning' | 'destructive';
  format?: 'number' | 'currency' | 'percentage';
}

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut' | 'column' | 'funnel';
  data: any[];
  config?: Record<string, any>;
  loading?: boolean;
}

interface ReportData {
  metrics: MetricData[];
  charts: ChartData[];
  rawData: any[];
  summary: {
    totalRecords: number;
    dateRange: DateRange;
    lastUpdated: Date;
    filters: ReportFilters;
  };
}

interface UseReportsReturn {
  data: ReportData | null;
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
  setFilters: (filters: Partial<ReportFilters>) => void;
  refreshData: () => Promise<void>;
  exportData: (format: string, options?: any) => Promise<void>;
  saveReport: (name: string, config: any) => Promise<void>;
  getSavedReports: () => any[];
}

const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
  to: new Date()
};

const DEFAULT_FILTERS: ReportFilters = {
  dateRange: DEFAULT_DATE_RANGE,
  source: [],
  status: [],
  category: [],
  priority: [],
  searchTerm: '',
  customFilters: {}
};

export const useReports = (initialFilters?: Partial<ReportFilters>): UseReportsReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReportFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  // Usar o hook useSavedReports para gerenciar relatórios salvos
  const { 
    reports: savedReports, 
    createReport, 
    loading: savedReportsLoading 
  } = useSavedReports();

  const { data: analyticsData, loading: analyticsLoading } = useAnalytics();

  // Função para atualizar filtros
  const setFilters = (newFilters: Partial<ReportFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Função para processar dados baseado nos filtros
  const processData = useMemo(() => {
    if (!analyticsData) return null;

    try {
      // Simular processamento de dados com base nos filtros
      const filteredData = applyFilters(analyticsData, filters);
      
      // Gerar métricas
      const metrics: MetricData[] = generateMetrics(filteredData, filters);
      
      // Gerar dados para gráficos
      const charts: ChartData[] = generateCharts(filteredData, filters);
      
      // Dados brutos filtrados
      const rawData = filteredData;
      
      return {
        metrics,
        charts,
        rawData,
        summary: {
          totalRecords: filteredData.length,
          dateRange: filters.dateRange,
          lastUpdated: new Date(),
          filters
        }
      };
    } catch (err) {
      console.error('Erro ao processar dados:', err);
      return null;
    }
  }, [analyticsData, filters]);

  // Função para aplicar filtros aos dados
  const applyFilters = (data: any, filters: ReportFilters) => {
    let filtered = [...data];

    // Filtro por data
    if (filters.dateRange) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt || item.date || Date.now());
        return itemDate >= filters.dateRange.from && itemDate <= filters.dateRange.to;
      });
    }

    // Filtro por fonte
    if (filters.source && filters.source.length > 0) {
      filtered = filtered.filter(item => 
        filters.source!.includes(item.source || item.type)
      );
    }

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(item => 
        filters.status!.includes(item.status)
      );
    }

    // Filtro por categoria
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(item => 
        filters.category!.includes(item.category || item.type)
      );
    }

    // Filtro por prioridade
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(item => 
        filters.priority!.includes(item.priority)
      );
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    return filtered;
  };

  // Função para gerar métricas
  const generateMetrics = (data: any[], filters: ReportFilters): MetricData[] => {
    const totalRecords = data.length;
    const previousPeriodData = getPreviousPeriodData(data, filters.dateRange);
    const previousTotal = previousPeriodData.length;
    const change = previousTotal > 0 ? ((totalRecords - previousTotal) / previousTotal) * 100 : 0;

    // Métricas básicas
    const metrics: MetricData[] = [
      {
        label: 'Total de Registros',
        value: totalRecords,
        change: change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        color: change > 0 ? 'success' : change < 0 ? 'destructive' : 'default',
        format: 'number'
      },
      {
        label: 'Média Diária',
        value: calculateDailyAverage(data, filters.dateRange),
        format: 'number'
      },
      {
        label: 'Taxa de Conversão',
        value: calculateConversionRate(data),
        format: 'percentage',
        color: 'success'
      },
      {
        label: 'Valor Total',
        value: calculateTotalValue(data),
        format: 'currency',
        color: 'default'
      }
    ];

    // Métricas específicas por categoria
    const categories = [...new Set(data.map(item => item.category || item.type))];
    categories.forEach(category => {
      const categoryData = data.filter(item => (item.category || item.type) === category);
      if (categoryData.length > 0) {
        metrics.push({
          label: `${category} - Total`,
          value: categoryData.length,
          format: 'number'
        });
      }
    });

    return metrics;
  };

  // Função para gerar dados de gráficos
  const generateCharts = (data: any[], filters: ReportFilters): ChartData[] => {
    const charts: ChartData[] = [];

    // Gráfico de linha - Tendência temporal
    charts.push({
      id: 'timeline-trend',
      title: 'Tendência Temporal',
      type: 'line',
      data: generateTimelineData(data, filters.dateRange)
    });

    // Gráfico de pizza - Distribuição por categoria
    charts.push({
      id: 'category-distribution',
      title: 'Distribuição por Categoria',
      type: 'pie',
      data: generateCategoryDistribution(data)
    });

    // Gráfico de barras - Status
    charts.push({
      id: 'status-breakdown',
      title: 'Breakdown por Status',
      type: 'bar',
      data: generateStatusBreakdown(data)
    });

    // Gráfico de área - Volume acumulado
    charts.push({
      id: 'cumulative-volume',
      title: 'Volume Acumulado',
      type: 'area',
      data: generateCumulativeData(data, filters.dateRange)
    });

    // Funil de conversão
    charts.push({
      id: 'conversion-funnel',
      title: 'Funil de Conversão',
      type: 'funnel',
      data: generateFunnelData(data)
    });

    return charts;
  };

  // Funções auxiliares para cálculos
  const getPreviousPeriodData = (data: any[], dateRange: DateRange) => {
    const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
    const previousFrom = new Date(dateRange.from.getTime() - periodLength);
    const previousTo = new Date(dateRange.from.getTime());
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.date || Date.now());
      return itemDate >= previousFrom && itemDate < previousTo;
    });
  };

  const calculateDailyAverage = (data: any[], dateRange: DateRange) => {
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? Math.round(data.length / days) : 0;
  };

  const calculateConversionRate = (data: any[]) => {
    const converted = data.filter(item => item.status === 'converted' || item.converted === true);
    return data.length > 0 ? Math.round((converted.length / data.length) * 100) : 0;
  };

  const calculateTotalValue = (data: any[]) => {
    return data.reduce((sum, item) => sum + (item.value || item.amount || 0), 0);
  };

  const generateTimelineData = (data: any[], dateRange: DateRange) => {
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const timeline = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.from.getTime() + i * 24 * 60 * 60 * 1000);
      const dayData = data.filter(item => {
        const itemDate = new Date(item.createdAt || item.date || Date.now());
        return itemDate.toDateString() === date.toDateString();
      });
      
      timeline.push({
        date: date.toISOString().split('T')[0],
        value: dayData.length,
        label: date.toLocaleDateString()
      });
    }
    
    return timeline;
  };

  const generateCategoryDistribution = (data: any[]) => {
    const categories = data.reduce((acc, item) => {
      const category = item.category || item.type || 'Outros';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const generateStatusBreakdown = (data: any[]) => {
    const statuses = data.reduce((acc, item) => {
      const status = item.status || 'Indefinido';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const generateCumulativeData = (data: any[], dateRange: DateRange) => {
    const timeline = generateTimelineData(data, dateRange);
    let cumulative = 0;
    
    return timeline.map(item => {
      cumulative += item.value;
      return { ...item, value: cumulative };
    });
  };

  const generateFunnelData = (data: any[]) => {
    const stages = [
      { name: 'Visitantes', value: data.length },
      { name: 'Leads', value: data.filter(item => item.type === 'lead').length },
      { name: 'Qualificados', value: data.filter(item => item.qualified === true).length },
      { name: 'Oportunidades', value: data.filter(item => item.status === 'opportunity').length },
      { name: 'Convertidos', value: data.filter(item => item.status === 'converted').length }
    ];
    
    return stages.filter(stage => stage.value > 0);
  };

  // Função para atualizar dados
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Os dados serão atualizados automaticamente via useMemo
      // quando analyticsData for atualizado
      
    } catch (err) {
      setError('Erro ao atualizar dados');
      console.error('Erro ao atualizar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para exportar dados
  const exportData = async (format: string, options?: any) => {
    try {
      console.log('Exportando dados:', { format, options, data: processData });
      
      // Aqui seria implementada a lógica real de exportação
      // Por exemplo, gerar PDF, Excel, CSV, etc.
      
      // Simular processo de exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error('Erro na exportação:', err);
      throw err;
    }
  };

  // Função para salvar relatório usando o hook useSavedReports
  const saveReport = async (name: string, config: any): Promise<void> => {
    try {
      await createReport({
        name,
        report_type: 'analytics', // Pode ser determinado dinamicamente
        config,
        filters,
        data: data?.rawData || [],
        is_public: false,
        is_favorite: false,
        tags: [],
        description: `Relatório gerado em ${new Date().toLocaleDateString()}`
      });
    } catch (err) {
      console.error('Erro ao salvar relatório:', err);
      throw err;
    }
  };

  // Função para obter relatórios salvos
  const getSavedReports = (): any[] => {
    return savedReports || [];
  };



  // Efeito para atualizar dados quando filtros ou analyticsData mudam
  useEffect(() => {
    if (processData) {
      setData(processData);
    }
  }, [processData]);

  // Efeito para gerenciar loading
  useEffect(() => {
    setLoading(analyticsLoading);
  }, [analyticsLoading]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    exportData,
    saveReport,
    getSavedReports: () => savedReports
  };
};

// Remover a função duplicada no final do arquivo