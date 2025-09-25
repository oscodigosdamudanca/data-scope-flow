import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Survey, CreateSurveyData } from '@/types/surveys';

// Mock implementation since surveys table doesn't exist yet
export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockSurveys: Survey[] = [
    {
      id: '1',
      title: 'Pesquisa de Satisfação do Cliente',
      description: 'Avalie nossa qualidade de atendimento',
      company_id: 'company-1',
      is_active: true,
      status: 'active',
      created_by: 'user-1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Feedback sobre Produto',
      description: 'Nos ajude a melhorar nossos produtos',
      company_id: 'company-1',
      is_active: false,
      status: 'draft',
      created_by: 'user-1',
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-10T14:30:00Z'
    },
    {
      id: '3',
      title: 'Avaliação de Treinamento',
      description: 'Como foi sua experiência no treinamento?',
      company_id: 'company-1',
      is_active: false,
      status: 'closed',
      created_by: 'user-1',
      created_at: '2024-01-05T09:00:00Z',
      updated_at: '2024-01-05T09:00:00Z'
    }
  ];

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados
      setSurveys(mockSurveys);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSurvey = async (surveyData: CreateSurveyData): Promise<boolean> => {
    try {
      const isActive = surveyData.is_active || false;
      const newSurvey: Survey = {
        id: Math.random().toString(36).substr(2, 9),
        title: surveyData.title,
        description: surveyData.description,
        is_active: isActive,
        status: isActive ? 'active' : 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'mock-user-id',
        company_id: 'mock-company-id'
      };
      
      setSurveys(prev => [...prev, newSurvey]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pesquisa');
      return false;
    }
  };

  const updateSurvey = async (id: string, updates: Partial<Survey>): Promise<boolean> => {
    try {
      setSurveys(prev => prev.map(survey => {
        if (survey.id === id) {
          const updatedSurvey = { ...survey, ...updates, updated_at: new Date().toISOString() };
          
          // Manter consistência entre is_active e status
          if (updates.is_active !== undefined) {
            updatedSurvey.status = updates.is_active ? 'active' : 'draft';
          }
          
          return updatedSurvey;
        }
        return survey;
      }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pesquisa');
      return false;
    }
  };

  const deleteSurvey = async (id: string): Promise<boolean> => {
    try {
      setSurveys(prev => prev.filter(survey => survey.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir pesquisa');
      return false;
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    loading,
    error,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    refetch: fetchSurveys
  };
}