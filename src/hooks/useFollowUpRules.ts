import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { FollowUpRule, CreateFollowUpRuleData, UpdateFollowUpRuleData } from '@/types/notifications';

export interface UseFollowUpRulesReturn {
  rules: FollowUpRule[];
  loading: boolean;
  error: string;
  createRule: (ruleData: CreateFollowUpRuleData) => Promise<void>;
  updateRule: (id: string, ruleData: UpdateFollowUpRuleData) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string, is_active: boolean) => Promise<void>;
  refetch: () => void;
}

export const useFollowUpRules = (companyId?: string): UseFollowUpRulesReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: rules = [], isLoading, refetch } = useQuery({
    queryKey: ['follow-up-rules', companyId],
    queryFn: async () => {
      if (!companyId || !user) return [];

      const { data, error } = await supabase
        .from('follow_up_rules')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching follow-up rules:', error);
        throw error;
      }

      return data as FollowUpRule[];
    },
    enabled: !!user && !!companyId,
  });

  const createRule = useCallback(async (ruleData: CreateFollowUpRuleData) => {
    if (!user || !companyId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follow_up_rules')
        .insert({
          ...ruleData,
          company_id: companyId,
        });

      if (error) throw error;

      toast({
        title: 'Regra criada',
        description: 'Regra de follow-up criada com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar regra';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, companyId, toast, refetch]);

  const updateRule = useCallback(async (id: string, ruleData: UpdateFollowUpRuleData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follow_up_rules')
        .update(ruleData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Regra atualizada',
        description: 'Regra de follow-up atualizada com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar regra';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, refetch]);

  const deleteRule = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follow_up_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Regra excluída',
        description: 'Regra de follow-up excluída com sucesso',
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir regra';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, refetch]);

  const toggleRule = useCallback(async (id: string, is_active: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follow_up_rules')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: is_active ? 'Regra ativada' : 'Regra desativada',
        description: `Regra de follow-up ${is_active ? 'ativada' : 'desativada'} com sucesso`,
      });
      
      refetch();
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar status da regra';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, refetch]);

  return {
    rules,
    loading: isLoading || loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch,
  };
};