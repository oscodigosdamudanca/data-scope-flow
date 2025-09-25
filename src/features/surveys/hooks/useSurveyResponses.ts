import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SurveyResponse, CreateSurveyResponseData } from '@/types/surveys';

// Mock implementation since survey_responses table doesn't exist yet
export function useSurveyResponses(surveyId?: string) {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockResponses: SurveyResponse[] = [
    {
      id: '1',
      survey_id: surveyId || '1',
      respondent_name: 'João Silva',
      respondent_email: 'joao@email.com',
      responses: {
        '1': 'Excelente',
        '2': 'Muito satisfeito com o atendimento recebido'
      },
      submitted_at: new Date().toISOString(),
      submitted_by: 'mock-user-id'
    },
    {
      id: '2',
      survey_id: surveyId || '1',
      respondent_name: 'Maria Santos',
      respondent_email: 'maria@email.com',
      responses: {
        '1': 'Bom',
        '2': 'Poderia melhorar alguns aspectos'
      },
      submitted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      submitted_by: 'mock-user-id'
    }
  ];

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar respostas por surveyId
      const filteredResponses = mockResponses.filter(r => r.survey_id === surveyId);
      setResponses(filteredResponses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const createResponse = async (responseData: CreateSurveyResponseData): Promise<SurveyResponse | null> => {
    if (!surveyId) {
      setError('ID da pesquisa é obrigatório');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newResponse: SurveyResponse = {
        id: Math.random().toString(36).substr(2, 9),
        survey_id: surveyId,
        respondent_name: responseData.respondent_name,
        respondent_email: responseData.respondent_email,
        respondent_phone: responseData.respondent_phone,
        responses: responseData.responses,
        submitted_at: new Date().toISOString(),
        submitted_by: user.id
      };

      setResponses(prev => [newResponse, ...prev]);
      return newResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar resposta');
      return null;
    }
  };

  const updateResponse = async (id: string, updates: Partial<SurveyResponse>): Promise<boolean> => {
    try {
      setResponses(prev => prev.map(response => 
        response.id === id ? { ...response, ...updates } : response
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar resposta');
      return false;
    }
  };

  const getResponsesByEmail = async (email: string): Promise<SurveyResponse[]> => {
    try {
      // Filter responses by email from current state
      const emailResponses = responses.filter(response => response.respondent_email === email);
      return emailResponses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar respostas por email');
      return [];
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [surveyId, fetchResponses]);

  const deleteResponse = async (id: string): Promise<boolean> => {
    try {
      setResponses(prev => prev.filter(response => response.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir resposta');
      return false;
    }
  };

  return {
    responses,
    loading,
    error,
    createResponse,
    updateResponse,
    deleteResponse,
    getResponsesByEmail,
    refetch: fetchResponses
  };
}