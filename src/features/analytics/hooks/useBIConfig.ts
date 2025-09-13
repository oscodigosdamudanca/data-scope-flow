import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'progress';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data_source: string;
  config: Record<string, any>;
  is_visible: boolean;
}

export interface LayoutConfig {
  columns: number;
  gap: number;
  theme: 'light' | 'dark';
  auto_refresh: boolean;
  refresh_interval: number;
}

export interface BIConfig {
  id: string;
  company_id: string;
  user_id: string;
  dashboard_type: 'leads' | 'surveys' | 'raffles' | 'feedback' | 'overview';
  widget_configs: WidgetConfig[];
  layout_config: LayoutConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBIConfig = (companyId: string, dashboardType: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Para fins de demonstração, retornamos configuração padrão
  // Uma vez que a tabela business_intelligence_configs não existe ainda
  const { data: config, isLoading } = useQuery({
    queryKey: ['bi-config', companyId, dashboardType, user?.id],
    queryFn: async () => {
      // Simular dados da configuração
      return null as BIConfig | null;
    },
    enabled: !!user && !!companyId && !!dashboardType,
  });

  // Mutation para criar/atualizar configuração (simulado)
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<BIConfig>) => {
      // Por enquanto apenas simular o salvamento
      console.log('Salvando configuração:', newConfig);
      return newConfig as BIConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['bi-config', companyId, dashboardType, user?.id] 
      });
      toast({
        title: 'Configuração salva',
        description: 'As configurações do dashboard foram atualizadas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar configuração (simulado)
  const deleteConfigMutation = useMutation({
    mutationFn: async () => {
      console.log('Deletando configuração');
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['bi-config', companyId, dashboardType, user?.id] 
      });
      toast({
        title: 'Configuração removida',
        description: 'As configurações do dashboard foram removidas.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover',
        description: error.message || 'Não foi possível remover as configurações.',
        variant: 'destructive',
      });
    },
  });

  // Configuração padrão de layout
  const getDefaultLayoutConfig = (): LayoutConfig => ({
    columns: 3,
    gap: 16,
    theme: 'light',
    auto_refresh: true,
    refresh_interval: 300000, // 5 minutos
  });

  // Widgets padrão para cada tipo de dashboard
  const getDefaultWidgets = (type: string): WidgetConfig[] => {
    const baseWidgets: Record<string, WidgetConfig[]> = {
      leads: [
        {
          id: 'leads-total',
          type: 'metric',
          title: 'Total de Leads',
          size: 'small',
          position: { x: 0, y: 0 },
          data_source: 'leads_count',
          config: { color: 'blue', icon: 'users' },
          is_visible: true,
        },
        {
          id: 'leads-today',
          type: 'metric',
          title: 'Leads Hoje',
          size: 'small',
          position: { x: 1, y: 0 },
          data_source: 'leads_today',
          config: { color: 'green', icon: 'trending-up' },
          is_visible: true,
        },
        {
          id: 'conversion-rate',
          type: 'metric',
          title: 'Taxa de Conversão',
          size: 'small',
          position: { x: 2, y: 0 },
          data_source: 'conversion_rate',
          config: { color: 'purple', icon: 'percent', suffix: '%' },
          is_visible: true,
        },
        {
          id: 'leads-chart',
          type: 'chart',
          title: 'Leads por Dia',
          size: 'large',
          position: { x: 0, y: 1 },
          data_source: 'daily_leads',
          config: { chart_type: 'line', color: 'blue' },
          is_visible: true,
        },
        {
          id: 'sources-chart',
          type: 'chart',
          title: 'Principais Fontes',
          size: 'medium',
          position: { x: 0, y: 2 },
          data_source: 'top_sources',
          config: { chart_type: 'pie' },
          is_visible: true,
        },
        {
          id: 'status-chart',
          type: 'chart',
          title: 'Leads por Status',
          size: 'medium',
          position: { x: 1, y: 2 },
          data_source: 'leads_by_status',
          config: { chart_type: 'bar' },
          is_visible: true,
        },
      ],
      surveys: [
        {
          id: 'surveys-total',
          type: 'metric',
          title: 'Total de Pesquisas',
          size: 'small',
          position: { x: 0, y: 0 },
          data_source: 'surveys_count',
          config: { color: 'blue', icon: 'clipboard-list' },
          is_visible: true,
        },
        {
          id: 'responses-total',
          type: 'metric',
          title: 'Total de Respostas',
          size: 'small',
          position: { x: 1, y: 0 },
          data_source: 'surveys_responses',
          config: { color: 'green', icon: 'message-circle' },
          is_visible: true,
        },
      ],
      overview: [
        {
          id: 'overview-leads',
          type: 'metric',
          title: 'Total de Leads',
          size: 'small',
          position: { x: 0, y: 0 },
          data_source: 'leads_count',
          config: { color: 'blue', icon: 'users' },
          is_visible: true,
        },
        {
          id: 'overview-surveys',
          type: 'metric',
          title: 'Pesquisas Ativas',
          size: 'small',
          position: { x: 1, y: 0 },
          data_source: 'surveys_count',
          config: { color: 'green', icon: 'clipboard-list' },
          is_visible: true,
        },
        {
          id: 'overview-conversion',
          type: 'metric',
          title: 'Taxa de Conversão',
          size: 'small',
          position: { x: 2, y: 0 },
          data_source: 'conversion_rate',
          config: { color: 'purple', icon: 'percent', suffix: '%' },
          is_visible: true,
        },
      ],
    };

    return baseWidgets[type] || [];
  };

  // Funções de manipulação
  const updateConfig = (newConfig: Partial<BIConfig>) => {
    updateConfigMutation.mutate(newConfig);
  };

  const resetToDefault = () => {
    const defaultConfig = {
      widget_configs: getDefaultWidgets(dashboardType),
      layout_config: getDefaultLayoutConfig(),
    };
    updateConfigMutation.mutate(defaultConfig);
  };

  const deleteConfig = () => {
    deleteConfigMutation.mutate();
  };

  const addWidget = (widget: WidgetConfig) => {
    const currentWidgets = config?.widget_configs || [];
    const newWidgets = [...currentWidgets, widget];
    updateConfig({ widget_configs: newWidgets });
  };

  const updateWidget = (widgetId: string, updates: Partial<WidgetConfig>) => {
    const currentWidgets = config?.widget_configs || [];
    const newWidgets = currentWidgets.map(widget => 
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    updateConfig({ widget_configs: newWidgets });
  };

  const removeWidget = (widgetId: string) => {
    const currentWidgets = config?.widget_configs || [];
    const newWidgets = currentWidgets.filter(widget => widget.id !== widgetId);
    updateConfig({ widget_configs: newWidgets });
  };

  const updateLayout = (layoutUpdates: Partial<LayoutConfig>) => {
    const currentLayout = config?.layout_config || getDefaultLayoutConfig();
    const newLayout = { ...currentLayout, ...layoutUpdates };
    updateConfig({ layout_config: newLayout });
  };

  return {
    config: config || {
      widget_configs: getDefaultWidgets(dashboardType),
      layout_config: getDefaultLayoutConfig(),
    },
    data: config,
    isLoading,
    loading: isLoading || updateConfigMutation.isPending,
    error,
    updateConfig,
    createConfig: updateConfig,
    deleteConfig,
    resetToDefault,
    addWidget,
    updateWidget,
    removeWidget,
    updateLayout,
    getDefaultWidgets,
  };
};