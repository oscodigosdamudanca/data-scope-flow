import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type {
  QuestionType,
  QuestionTypeInsert,
  QuestionTypeUpdate,
  QuestionTypeWithQuestions,
  CreateQuestionTypeData,
  UpdateQuestionTypeData
} from '@/types/questions';

export const useQuestionTypes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch question types
  const {
    data: questionTypes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['questionTypes', user?.id],
    queryFn: async (): Promise<QuestionTypeWithQuestions[]> => {
      const { data, error } = await supabase
        .from('question_types')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        questions_count: 0 // Will be populated when needed
      }));
    },
    enabled: !!user
  });

  // Create question type mutation
  const createQuestionTypeMutation = useMutation({
    mutationFn: async (data: CreateQuestionTypeData): Promise<QuestionType> => {
      if (!user) throw new Error('User not authenticated');

      const insertData: QuestionTypeInsert = {
        ...data,
        created_by: user.id,
        is_active: true
      };

      const { data: result, error } = await supabase
        .from('question_types')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionTypes'] });
      toast({
        title: 'Sucesso',
        description: 'Tipo de pergunta criado com sucesso!'
      });
    },
    onError: (error: any) => {
      console.error('Error creating question type:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar tipo de pergunta. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Update question type mutation
  const updateQuestionTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuestionTypeData }): Promise<QuestionType> => {
      const updateData: QuestionTypeUpdate = data;

      const { data: result, error } = await supabase
        .from('question_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionTypes'] });
      toast({
        title: 'Sucesso',
        description: 'Tipo de pergunta atualizado com sucesso!'
      });
    },
    onError: (error: any) => {
      console.error('Error updating question type:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tipo de pergunta. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Delete question type mutation (soft delete)
  const deleteQuestionTypeMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('question_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionTypes'] });
      toast({
        title: 'Sucesso',
        description: 'Tipo de pergunta removido com sucesso!'
      });
    },
    onError: (error: any) => {
      console.error('Error deleting question type:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover tipo de pergunta. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const createQuestionType = (data: CreateQuestionTypeData) => {
    return createQuestionTypeMutation.mutateAsync(data);
  };

  const updateQuestionType = (id: string, data: UpdateQuestionTypeData) => {
    return updateQuestionTypeMutation.mutateAsync({ id, data });
  };

  const deleteQuestionType = (id: string) => {
    return deleteQuestionTypeMutation.mutateAsync(id);
  };

  return {
    // Data
    questionTypes: questionTypes || [],
    loading: isLoading,
    error,
    
    // Actions
    refetch,
    createQuestionType,
    updateQuestionType,
    deleteQuestionType,
    
    // Mutations
    createQuestionTypeMutation,
    updateQuestionTypeMutation,
    deleteQuestionTypeMutation,
    
    // Loading states
    isCreating: createQuestionTypeMutation.isPending,
    isUpdating: updateQuestionTypeMutation.isPending,
    isDeleting: deleteQuestionTypeMutation.isPending
  };
};

export type UseQuestionTypesReturn = ReturnType<typeof useQuestionTypes>;