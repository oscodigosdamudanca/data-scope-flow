import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadFilters, CreateLeadData, UpdateLeadData } from '@/types/leads';

export const useLeads = (companyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads', companyId],
    queryFn: async () => {
      if (!companyId || !user) return [];

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      return data as Lead[];
    },
    enabled: !!user && !!companyId,
  });

  const fetchLeads = useCallback(async (filters?: LeadFilters) => {
    setLoading(true);
    try {
      if (!companyId || !user) return;

      let query = supabase
        .from('leads')
        .select('*')
        .eq('company_id', companyId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      refetch();
      setError('');
    } catch (err) {
      setError('Erro ao buscar leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, user, refetch]);

  const createLead = useCallback(async (leadData: CreateLeadData) => {
    if (!user || !companyId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          company_id: companyId,
          created_by: user.id,
          captured_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Lead criado',
        description: 'Lead foi criado com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lead';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      console.error('Error creating lead:', err);
    } finally {
      setLoading(false);
    }
  }, [user, companyId, toast, refetch]);

  const updateLead = useCallback(async (id: string, leadData: UpdateLeadData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Lead atualizado',
        description: 'Lead foi atualizado com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      console.error('Error updating lead:', err);
    } finally {
      setLoading(false);
    }
  }, [toast, refetch]);

  const deleteLead = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Lead excluído',
        description: 'Lead foi excluído com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir lead';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      console.error('Error deleting lead:', err);
    } finally {
      setLoading(false);
    }
  }, [toast, refetch]);

  const getLeadStats = useCallback(async () => {
    if (!companyId || !user) {
      return {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0,
        conversionRate: 0,
      };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('company_id', companyId);

      if (error) throw error;

      const stats = data.reduce((acc, lead) => {
        acc.total++;
        acc[lead.status as keyof typeof acc]++;
        return acc;
      }, {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0,
        conversionRate: 0,
      });

      stats.conversionRate = stats.total > 0 ? (stats.converted / stats.total) * 100 : 0;
      return stats;
    } catch (err) {
      console.error('Error getting lead stats:', err);
      return {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0,
        conversionRate: 0,
      };
    }
  }, [companyId, user]);

  return {
    leads,
    loading: isLoading || loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats,
    refetch,
  };
};