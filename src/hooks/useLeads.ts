import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { CreateLeadData, UpdateLeadData, Lead } from '@/types/leads';

export const useLeads = (companyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLead = useCallback(async (leadData: CreateLeadData): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar o ID da empresa do contexto ou o passado como parâmetro
      const effectiveCompanyId = companyId || 'default-company-id';
      
      // Gerar um ID único para o lead
      const leadId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('leads')
        .insert({
          id: leadId,
          ...leadData,
          company_id: effectiveCompanyId,
          created_by: user?.id,
          status: 'new',
          captured_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      return leadId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lead';
      setError(message);
      console.error('Erro ao criar lead:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [companyId, user]);

  const updateLead = useCallback(async (id: string, leadData: UpdateLeadData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...leadData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      setError(message);
      console.error('Erro ao atualizar lead:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir lead';
      setError(message);
      console.error('Erro ao excluir lead:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLeadById = useCallback(async (id: string): Promise<Lead | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data as Lead;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar lead';
      setError(message);
      console.error('Erro ao buscar lead:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    isLoading,
    error
  };
};

export default useLeads;