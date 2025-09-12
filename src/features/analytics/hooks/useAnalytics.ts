import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useAnalytics = (companyId?: string, dateRange?: DateRange) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query para dados básicos de leads
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['analytics-leads', companyId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Query para dados de surveys
  const { data: surveysData, isLoading: surveysLoading } = useQuery({
    queryKey: ['analytics-surveys', companyId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('surveys')
        .select(`
          *,
          survey_responses(count)
        `);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Processar dados de analytics
  const processAnalyticsData = (): AnalyticsData | null => {
    if (!leadsData || !surveysData) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Contar leads por período
    const leadsToday = leadsData.filter(lead => 
      new Date(lead.created_at) >= today
    ).length;

    const leadsThisWeek = leadsData.filter(lead => 
      new Date(lead.created_at) >= thisWeek
    ).length;

    const leadsThisMonth = leadsData.filter(lead => 
      new Date(lead.created_at) >= thisMonth
    ).length;

    // Agrupar por fonte
    const sourceGroups = leadsData.reduce((acc, lead) => {
      const source = lead.source || 'Não informado';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceGroups)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Agrupar por status
    const statusGroups = leadsData.reduce((acc, lead) => {
      const status = lead.status || 'novo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsByStatus = Object.entries(statusGroups)
      .map(([status, count]) => ({ status, count }));

    // Agrupar por interesse
    const interestGroups = leadsData.reduce((acc, lead) => {
      const interests = lead.interests || [];
      interests.forEach((interest: string) => {
        acc[interest] = (acc[interest] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const leadsByInterest = Object.entries(interestGroups)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Dados diários dos últimos 30 dias
    const dailyLeads = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = leadsData.filter(lead => 
        lead.created_at.startsWith(dateStr)
      ).length;
      dailyLeads.push({ date: dateStr, count });
    }

    // Dados semanais das últimas 12 semanas
    const weeklyLeads = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const count = leadsData.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= weekStart && leadDate < weekEnd;
      }).length;
      weeklyLeads.push({ 
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`, 
        count 
      });
    }

    // Dados mensais dos últimos 12 meses
    const monthlyLeads = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = leadsData.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= monthDate && leadDate < nextMonth;
      }).length;
      monthlyLeads.push({ 
        month: `${monthDate.getMonth() + 1}/${monthDate.getFullYear()}`, 
        count 
      });
    }

    // Calcular taxa de conversão (leads qualificados / total de leads)
    const qualifiedLeads = leadsData.filter(lead => 
      ['qualificado', 'convertido'].includes(lead.status)
    ).length;
    const conversionRate = leadsData.length > 0 
      ? (qualifiedLeads / leadsData.length) * 100 
      : 0;

    // Contar respostas de surveys
    const surveysResponses = surveysData.reduce((total, survey) => {
      return total + (survey.survey_responses?.length || 0);
    }, 0);

    const totalLeads = leadsData.length;
    const completedSurveys = surveysResponses;
    const totalSurveys = surveysData.length;
    
    return {
      // Contadores principais
      leadsCount: totalLeads,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      surveysCount: totalSurveys,
      surveysResponses: completedSurveys,
      conversionRate: Math.round(conversionRate * 100) / 100,
      
      // Propriedades compatíveis com AnalyticsPage
      totalLeads,
      newLeads: leadsToday,
      completedSurveys,
      newSurveys: surveysData.filter(s => {
        const createdAt = new Date(s.created_at);
        const today = new Date();
        return createdAt.toDateString() === today.toDateString();
      }).length,
      totalSurveys,
      completionRate: totalSurveys ? (completedSurveys / totalSurveys) * 100 : 0,
      
      // Arrays de dados para gráficos
      topSources,
      leadsByStatus,
      leadsByInterest,
      dailyLeads,
      weeklyLeads,
      monthlyLeads,
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
  };
};