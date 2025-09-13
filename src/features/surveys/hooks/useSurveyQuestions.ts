import { useState, useEffect } from 'react';
import type { SurveyQuestion, CreateSurveyQuestionData } from '@/types/surveys';

// Mock implementation since survey_questions table doesn't exist yet
export function useSurveyQuestions(surveyId?: string) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockQuestions: SurveyQuestion[] = [
    {
      id: '1',
      survey_id: surveyId || '1',
      question_text: 'Como você avalia nosso atendimento?',
      question_type: 'multiple_choice',
      options: ['Excelente', 'Bom', 'Regular', 'Ruim'],
      is_required: true,
      order_index: 0,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      survey_id: surveyId || '1',
      question_text: 'Deixe seus comentários adicionais:',
      question_type: 'text',
      options: null,
      is_required: false,
      order_index: 1,
      created_at: new Date().toISOString()
    }
  ];

  const fetchQuestions = async () => {
    if (!surveyId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock questions by surveyId
      const filteredQuestions = mockQuestions.filter(q => q.survey_id === surveyId);
      setQuestions(filteredQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: CreateSurveyQuestionData): Promise<SurveyQuestion | null> => {
    if (!surveyId) {
      setError('ID da pesquisa é obrigatório');
      return null;
    }

    try {
      const newQuestion: SurveyQuestion = {
        id: Math.random().toString(36).substr(2, 9),
        survey_id: surveyId,
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        options: questionData.options,
        is_required: questionData.is_required || false,
        order_index: questionData.order_index || questions.length,
          created_at: new Date().toISOString()
      };

      setQuestions(prev => [...prev, newQuestion].sort((a, b) => a.order_index - b.order_index));
      return newQuestion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pergunta');
      return null;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<SurveyQuestion>): Promise<boolean> => {
    try {
      setQuestions(prev => prev.map(question => 
        question.id === id ? { ...question, ...updates, updated_at: new Date().toISOString() } : question
      ).sort((a, b) => a.order_index - b.order_index));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pergunta');
      return false;
    }
  };

  const deleteQuestion = async (id: string): Promise<boolean> => {
    try {
      setQuestions(prev => prev.filter(question => question.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir pergunta');
      return false;
    }
  };

  const reorderQuestions = async (questionIds: string[]): Promise<boolean> => {
    try {
      setQuestions(prev => prev.map(question => {
        const newIndex = questionIds.indexOf(question.id);
        return newIndex !== -1 ? { ...question, order_index: newIndex } : question;
      }).sort((a, b) => a.order_index - b.order_index));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar perguntas');
      return false;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [surveyId]);

  return {
    questions,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    refetch: fetchQuestions
  };
}