import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { 
  Candidate, 
  CandidateInsert, 
  CandidateUpdate, 
  CandidateFilters 
} from '@/types/interviews';

export const useCandidates = (filters?: CandidateFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para listar candidatos
  const candidatesQuery = useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar candidatos:', error);
        throw error;
      }

      return data as Candidate[];
    },
    enabled: !!user
  });

  // Query para buscar um candidato específico
  const getCandidateQuery = (id: string) => useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          company:companies(name),
          interviews:interviews(
            id,
            title,
            status,
            scheduled_at,
            overall_rating
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar candidato:', error);
        throw error;
      }

      return data as Candidate & {
        company: { name: string };
        interviews: Array<{
          id: string;
          title: string;
          status: string;
          scheduled_at: string;
          overall_rating?: number;
        }>;
      };
    },
    enabled: !!id && !!user
  });

  // Mutation para criar candidato
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: CandidateInsert) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar candidato:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar candidato:', error);
      toast.error('Erro ao criar candidato. Tente novamente.');
    }
  });

  // Mutation para atualizar candidato
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CandidateUpdate }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar candidato:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
      toast.success('Candidato atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar candidato:', error);
      toast.error('Erro ao atualizar candidato. Tente novamente.');
    }
  });

  // Mutation para deletar candidato
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar candidato:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar candidato:', error);
      toast.error('Erro ao remover candidato. Tente novamente.');
    }
  });

  // Função para atualizar status do candidato
  const updateCandidateStatus = (id: string, status: CandidateUpdate['status']) => {
    if (!status) return;
    updateCandidateMutation.mutate({ id, updates: { status } });
  };

  return {
    // Queries
    candidates: candidatesQuery.data || [],
    isLoading: candidatesQuery.isLoading,
    error: candidatesQuery.error,
    getCandidateQuery,
    
    // Mutations
    createCandidate: createCandidateMutation.mutate,
    updateCandidate: updateCandidateMutation.mutate,
    deleteCandidate: deleteCandidateMutation.mutate,
    updateCandidateStatus,
    
    // Loading states
    isCreating: createCandidateMutation.isPending,
    isUpdating: updateCandidateMutation.isPending,
    isDeleting: deleteCandidateMutation.isPending
  };
};

// Hook para estatísticas de candidatos
export const useCandidateStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate-stats'],
    queryFn: async () => {
      // Buscar estatísticas por status
      const { data: statusStats, error: statusError } = await supabase
        .from('candidates')
        .select('status')
        .then(({ data, error }) => {
          if (error) throw error;
          
          const stats = data?.reduce((acc, candidate) => {
            acc[candidate.status] = (acc[candidate.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
          
          return { data: stats, error: null };
        });

      if (statusError) {
        console.error('Erro ao buscar estatísticas:', statusError);
        throw statusError;
      }

      // Buscar total de candidatos
      const { count: totalCandidates, error: countError } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Erro ao contar candidatos:', countError);
        throw countError;
      }

      return {
        totalCandidates: totalCandidates || 0,
        byStatus: statusStats || {}
      };
    },
    enabled: !!user
  });
};