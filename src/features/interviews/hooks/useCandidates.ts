import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { 
  Candidate, 
  CandidateInsert, 
  CandidateUpdate, 
  CandidateFilters,
  CandidateStatus
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
          companies(
            id,
            name
          )
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
  const updateCandidateStatus = (id: string, status: CandidateStatus) => {
    updateCandidateMutation.mutate({ id, updates: { status } });
  };

  return {
    // Queries
    candidates: candidatesQuery.data || [],
    isLoading: candidatesQuery.isLoading,
    error: candidatesQuery.error,
    
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