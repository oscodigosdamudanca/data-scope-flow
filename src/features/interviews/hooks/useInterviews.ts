import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { 
  Interview, 
  InterviewInsert, 
  InterviewUpdate, 
  InterviewFilters,
  InterviewStats
} from '@/types/interviews';

export const useInterviews = (filters?: InterviewFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para listar entrevistas
  const interviewsQuery = useQuery({
    queryKey: ['interviews', filters],
    queryFn: async () => {
      let query = supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(
            id,
            name,
            email,
            status
          ),
          interviewer:profiles!interviews_interviewer_id_fkey(
            id,
            full_name,
            email
          ),
          company:companies(
            id,
            name
          )
        `)
        .order('scheduled_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.interviewer_id) {
        query = query.eq('interviewer_id', filters.interviewer_id);
      }

      if (filters?.candidate_id) {
        query = query.eq('candidate_id', filters.candidate_id);
      }

      if (filters?.date_from) {
        query = query.gte('scheduled_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('scheduled_at', filters.date_to);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar entrevistas:', error);
        throw error;
      }

      return data as Interview[];
    },
    enabled: !!user
  });

  // Query para buscar uma entrevista específica
  const getInterviewQuery = (id: string) => useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(
            id,
            name,
            email,
            phone,
            status,
            resume_url,
            linkedin_url,
            portfolio_url
          ),
          interviewer:profiles!interviews_interviewer_id_fkey(
            id,
            full_name,
            email
          ),
          company:companies(
            id,
            name
          ),
          interview_questions:interview_questions(
            id,
            order_index,
            is_required,
            time_limit_minutes,
            question:questions(
              id,
              title,
              content,
              category,
              difficulty
            )
          ),
          interview_responses:interview_responses(
            id,
            response_text,
            response_file_url,
            rating,
            feedback,
            time_spent_seconds,
            question:questions(
              id,
              title,
              content
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar entrevista:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id && !!user
  });

  // Mutation para criar entrevista
  const createInterviewMutation = useMutation({
    mutationFn: async (interviewData: InterviewInsert) => {
      const { data, error } = await supabase
        .from('interviews')
        .insert([interviewData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar entrevista:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Entrevista criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar entrevista:', error);
      toast.error('Erro ao criar entrevista. Tente novamente.');
    }
  });

  // Mutation para atualizar entrevista
  const updateInterviewMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InterviewUpdate }) => {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar entrevista:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
      toast.success('Entrevista atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar entrevista:', error);
      toast.error('Erro ao atualizar entrevista. Tente novamente.');
    }
  });

  // Mutation para deletar entrevista
  const deleteInterviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar entrevista:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Entrevista removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar entrevista:', error);
      toast.error('Erro ao remover entrevista. Tente novamente.');
    }
  });

  // Função para iniciar entrevista
  const startInterview = (id: string) => {
    updateInterviewMutation.mutate({ 
      id, 
      updates: { 
        status: 'in_progress',
        started_at: new Date().toISOString()
      } 
    });
  };

  // Função para finalizar entrevista
  const completeInterview = (id: string, rating?: number, recommendation?: string) => {
    updateInterviewMutation.mutate({ 
      id, 
      updates: { 
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_rating: rating,
        recommendation
      } 
    });
  };

  // Função para cancelar entrevista
  const cancelInterview = (id: string, reason?: string) => {
    updateInterviewMutation.mutate({ 
      id, 
      updates: { 
        status: 'cancelled',
        notes: reason
      } 
    });
  };

  return {
    // Queries
    interviews: interviewsQuery.data || [],
    isLoading: interviewsQuery.isLoading,
    error: interviewsQuery.error,
    getInterviewQuery,
    
    // Mutations
    createInterview: createInterviewMutation.mutate,
    updateInterview: updateInterviewMutation.mutate,
    deleteInterview: deleteInterviewMutation.mutate,
    startInterview,
    completeInterview,
    cancelInterview,
    
    // Loading states
    isCreating: createInterviewMutation.isPending,
    isUpdating: updateInterviewMutation.isPending,
    isDeleting: deleteInterviewMutation.isPending
  };
};

// Hook para estatísticas de entrevistas
export const useInterviewStats = (companyId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['interview-stats', companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error('Company ID é obrigatório para estatísticas');
      }

      const { data, error } = await supabase
        .rpc('get_interview_stats', { company_uuid: companyId });

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      return data as InterviewStats;
    },
    enabled: !!user && !!companyId
  });
};

// Hook para entrevistas do usuário (como entrevistador)
export const useMyInterviews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(
            id,
            name,
            email,
            status
          ),
          company:companies(
            id,
            name
          )
        `)
        .eq('interviewer_id', user?.id)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar minhas entrevistas:', error);
        throw error;
      }

      return data as Interview[];
    },
    enabled: !!user
  });
};

// Hook para próximas entrevistas
export const useUpcomingInterviews = (limit: number = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['upcoming-interviews', limit],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(
            id,
            name,
            email
          )
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar próximas entrevistas:', error);
        throw error;
      }

      return data as Interview[];
    },
    enabled: !!user
  });
};