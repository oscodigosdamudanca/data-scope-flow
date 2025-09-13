import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadFilters, CreateLeadData, UpdateLeadData } from '@/types/leads';

export const useLeads = (companyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Mock query since leads table doesn't exist yet
  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads', companyId],
    queryFn: async () => {
      // Return mock empty array since table doesn't exist
      return [] as Lead[];
    },
    enabled: !!user,
  });

  // Mock fetch function
  const fetchLeads = useCallback(async (filters?: LeadFilters) => {
    setLoading(true);
    try {
      // Mock implementation - just log and set no error
      console.log('Mock: Fetching leads with filters:', filters);
      setError('');
    } catch (err) {
      setError('Erro ao buscar leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock create function
  const createLead = useCallback(async (leadData: CreateLeadData) => {
    setLoading(true);
    try {
      console.log('Mock: Creating lead:', leadData);
      toast({
        title: 'Lead criado',
        description: 'Lead foi criado com sucesso',
      });
      setError('');
      // Don't actually call refetch since it would fail
    } catch (err) {
      setError('Erro ao criar lead');
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o lead',
        variant: 'destructive',
      });
      console.error('Error creating lead:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mock update function
  const updateLead = useCallback(async (id: string, leadData: UpdateLeadData) => {
    setLoading(true);
    try {
      console.log('Mock: Updating lead:', id, leadData);
      toast({
        title: 'Lead atualizado',
        description: 'Lead foi atualizado com sucesso',
      });
      setError('');
    } catch (err) {
      setError('Erro ao atualizar lead');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o lead',
        variant: 'destructive',
      });
      console.error('Error updating lead:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mock delete function
  const deleteLead = useCallback(async (id: string) => {
    setLoading(true);
    try {
      console.log('Mock: Deleting lead:', id);
      toast({
        title: 'Lead excluído',
        description: 'Lead foi excluído com sucesso',
      });
      setError('');
    } catch (err) {
      setError('Erro ao excluir lead');
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o lead',
        variant: 'destructive',
      });
      console.error('Error deleting lead:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mock stats function
  const getLeadStats = useCallback(async () => {
    return {
      total: 0,
      new: 0,
      qualified: 0,
      converted: 0,
      conversionRate: 0,
    };
  }, []);

  return {
    leads,
    loading: isLoading || loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats,
    refetch: () => {
      // Mock refetch - do nothing since query would fail
      console.log('Mock: Refetching leads');
    },
  };
};