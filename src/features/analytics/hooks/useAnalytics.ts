import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeAnalytics } from './useRealtimeAnalytics';

export interface AnalyticsData {
  // Contadores principais
  leadsCount: number;
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  surveysCount: number;
  surveysResponses: number;
  conversionRate: number;
  
  // Propriedades compatíveis com AnalyticsPage
  totalLeads: number;
  newLeads: number;
  completedSurveys: number;
  newSurveys: number;
  totalSurveys: number;
  completionRate: number;
  
  // Arrays de dados para gráficos
  topSources: Array<{ source: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsByInterest: Array<{ interest: string; count: number }>;
  dailyLeads: Array<{ date: string; count: number }>;
  weeklyLeads: Array<{ week: string; count: number }>;
  monthlyLeads: Array<{ month: string; count: number }>;
  
  // Additional properties for components
  avgResponseTime?: number;
  topInterests?: Array<{ interest: string; count: number }>;
  surveysByType?: Array<{ type: string; count: number }>;
  recentActivity?: Array<{ id: string; type: string; description: string; timestamp: string }>;
  leadsBySource?: Array<{ source: string; count: number }>;
  leadsByLocation?: Array<{ location: string; count: number }>;
  leadsTimeline?: Array<{ date: string; count: number }>;
  topPerformingContent?: Array<{ title: string; leads: number }>;
  recentLeads?: Array<{ id: string; name: string; source: string; createdAt: string; status?: string; email?: string; phone?: string; interest?: string }>;
  surveysByStatus?: Array<{ status: string; count: number }>;
  responsesByQuestion?: Array<{ question: string; responses: number }>;
  surveyRatings?: Array<{ rating: number; count: number }>;
  recentSurveys?: Array<{ id: string; title: string; responses: number; createdAt: string; status?: string; type?: string }>;
  topPerformingSurveys?: Array<{ title: string; completionRate: number; responses?: number }>;
  abandonmentRate?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useAnalytics = (companyId?: string, dateRange?: DateRange) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeData, setRealtimeData] = useState<Partial<AnalyticsData>>({});

  // Integração com Supabase Realtime
  const { 
    isConnected: realtimeConnected, 
    lastUpdate, 
    events: realtimeEvents,
    config: realtimeConfig,
    updateConfig: updateRealtimeConfig 
  } = useRealtimeAnalytics(companyId, (updatedData) => {
    setRealtimeData(prev => ({ ...prev, ...updatedData }));
  });

  // Since leads and surveys tables don't exist yet, we'll use mock data
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['analytics-leads', companyId, dateRange],
    queryFn: async () => {
      // Mock leads data for now
      return [];
    },
    enabled: !!user,
  });

  const { data: surveysData, isLoading: surveysLoading } = useQuery({
    queryKey: ['analytics-surveys', companyId, dateRange],
    queryFn: async () => {
      // Mock surveys data for now
      return [];
    },
    enabled: !!user,
  });

  // Processar dados de analytics com integração Realtime
  const processAnalyticsData = (): AnalyticsData | null => {
    if (!leadsData || !surveysData) return null;

    // Mock data with proper typing
    const topSources = [
      { source: 'Website', count: 25 },
      { source: 'Redes Sociais', count: 18 },
      { source: 'Email', count: 12 }
    ];

    const leadsByStatus = [
      { status: 'novo', count: 45 },
      { status: 'qualificado', count: 30 },
      { status: 'convertido', count: 15 }
    ];

    const leadsByInterest = [
      { interest: 'Produto A', count: 35 },
      { interest: 'Produto B', count: 25 },
      { interest: 'Serviço X', count: 20 }
    ];

    const dailyLeads = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = Math.floor(Math.random() * 10);
      dailyLeads.push({ date: dateStr, count });
    }

    const weeklyLeads = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const count = Math.floor(Math.random() * 50);
      weeklyLeads.push({ 
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`, 
        count 
      });
    }

    const monthlyLeads = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const count = Math.floor(Math.random() * 200);
      monthlyLeads.push({ 
        month: `${monthDate.getMonth() + 1}/${monthDate.getFullYear()}`, 
        count 
      });
    }

    // Aplicar dados em tempo real se disponíveis
    const baseLeadsCount = 90;
    const baseSurveysResponses = 42;
    const totalLeads = baseLeadsCount + (realtimeData.leadsCount || 0);
    const completedSurveys = baseSurveysResponses + (realtimeData.surveysResponses || 0);
    const totalSurveys = 15;
    const conversionRate = 35.5;
    
    return {
      // Contadores principais com dados em tempo real
      leadsCount: totalLeads,
      leadsToday: Math.floor(Math.random() * 10) + (realtimeData.leadsToday || 0),
      leadsThisWeek: Math.floor(Math.random() * 50) + (realtimeData.leadsThisWeek || 0),
      leadsThisMonth: Math.floor(Math.random() * 200) + (realtimeData.leadsThisMonth || 0),
      surveysCount: totalSurveys,
      surveysResponses: completedSurveys,
      conversionRate: Number(conversionRate.toFixed(2)),
      
      // Propriedades compatíveis com AnalyticsPage
      totalLeads,
      newLeads: Math.floor(Math.random() * 10),
      completedSurveys,
      newSurveys: Math.floor(Math.random() * 5),
      totalSurveys,
      completionRate: totalSurveys ? (completedSurveys / totalSurveys) * 100 : 0,
      
      // Arrays de dados para gráficos
      topSources,
      leadsByStatus,
      leadsByInterest,
      dailyLeads,
      weeklyLeads,
      monthlyLeads,
      
      // Additional mock properties with proper types
      avgResponseTime: 45,
      topInterests: leadsByInterest,
      surveysByType: [{ type: 'Feedback', count: 10 }, { type: 'Avaliação', count: 5 }],
      recentActivity: [
        { id: '1', type: 'lead', description: 'Novo lead cadastrado', timestamp: new Date().toISOString() }
      ],
      leadsBySource: topSources,
      leadsByLocation: [{ location: 'São Paulo', count: 15 }, { location: 'Rio de Janeiro', count: 8 }],
      leadsTimeline: dailyLeads,
      topPerformingContent: [{ title: 'Landing Page Principal', leads: 25 }],
      recentLeads: [{ 
        id: '1', 
        name: 'João Silva', 
        source: 'Website', 
        createdAt: new Date().toISOString(),
        status: 'novo',
        email: 'joao@email.com',
        phone: '11999999999',
        interest: 'Produto A'
      }],
      surveysByStatus: [{ status: 'ativo', count: 5 }, { status: 'finalizado', count: 10 }],
      responsesByQuestion: [{ question: 'Como avalia nosso serviço?', responses: 42 }],
      surveyRatings: [{ rating: 5, count: 20 }, { rating: 4, count: 15 }],
      recentSurveys: [{ 
        id: '1', 
        title: 'Pesquisa de Satisfação', 
        responses: 42, 
        createdAt: new Date().toISOString(),
        status: 'ativo',
        type: 'feedback'
      }],
      topPerformingSurveys: [{ 
        title: 'Pesquisa de Satisfação', 
        completionRate: 85,
        responses: 42
      }],
      abandonmentRate: 15
    };
  };

  const analyticsData = processAnalyticsData();
  const isLoading = leadsLoading || surveysLoading;

  return {
    data: analyticsData,
    loading: isLoading,
    error,
    refetch: () => {
      // Implementar refetch se necessário
    },
    // Dados do Realtime
    realtimeConnected,
    lastUpdate,
    realtimeEvents,
    realtimeConfig,
    updateRealtimeConfig
  };
};