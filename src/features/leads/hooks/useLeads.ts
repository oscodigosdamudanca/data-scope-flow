import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadFilters, LeadStats } from '@/types/leads';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLeads = async (filters?: LeadFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('leads')
        .select('*')
        .order('captured_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.dateFrom) {
        query = query.gte('captured_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('captured_at', filters.dateTo);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLeads(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar leads';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: CreateLeadData): Promise<Lead | null> => {
    try {
      setError(null);

      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('Usuário não está associado a uma empresa');
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          company_id: profile.company_id,
          interests: leadData.interests || []
        })
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => [data, ...prev]);
      toast.success('Lead criado com sucesso!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lead';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const updateLead = async (id: string, leadData: UpdateLeadData): Promise<Lead | null> => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast.success('Lead atualizado com sucesso!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead excluído com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir lead';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const getLeadStats = async (): Promise<LeadStats | null> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status');

      if (error) throw error;

      const stats = data.reduce((acc, lead) => {
        acc.total++;
        acc[lead.status as keyof Omit<LeadStats, 'total' | 'conversionRate'>]++;
        return acc;
      }, {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      });

      const conversionRate = stats.total > 0 ? (stats.converted / stats.total) * 100 : 0;

      return {
        ...stats,
        conversionRate: Math.round(conversionRate * 100) / 100
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats
  };
}