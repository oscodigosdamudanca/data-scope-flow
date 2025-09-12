import { CreateSurveyQuestionData } from '@/types/surveys';

// Tipos para a integração com IA
export interface AIQuestionSuggestion {
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  options?: string[];
  reasoning?: string;
}

export interface AIQuestionRequest {
  surveyTitle: string;
  surveyDescription?: string;
  targetAudience?: string;
  industry?: string;
  questionCount?: number;
  existingQuestions?: string[];
}

export interface AIResponse {
  suggestions: AIQuestionSuggestion[];
  confidence: number;
  reasoning: string;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Gera sugestões de perguntas usando IA baseado no contexto da pesquisa
   */
  async generateQuestionSuggestions(request: AIQuestionRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Chave da API OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env');
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em criação de pesquisas e questionários. Sua tarefa é sugerir perguntas relevantes e bem estruturadas baseadas no contexto fornecido. Sempre responda em formato JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da API OpenAI');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Erro ao gerar sugestões de perguntas:', error);
      throw error;
    }
  }

  /**
   * Constrói o prompt para a IA baseado na requisição
   */
  private buildPrompt(request: AIQuestionRequest): string {
    const {
      surveyTitle,
      surveyDescription,
      targetAudience,
      industry,
      questionCount = 5,
      existingQuestions = []
    } = request;

    let prompt = `Crie ${questionCount} perguntas para uma pesquisa com as seguintes características:\n\n`;
    prompt += `Título: ${surveyTitle}\n`;
    
    if (surveyDescription) {
      prompt += `Descrição: ${surveyDescription}\n`;
    }
    
    if (targetAudience) {
      prompt += `Público-alvo: ${targetAudience}\n`;
    }
    
    if (industry) {
      prompt += `Setor/Indústria: ${industry}\n`;
    }

    if (existingQuestions.length > 0) {
      prompt += `\nPerguntas já existentes (evite duplicar):\n`;
      existingQuestions.forEach((q, i) => {
        prompt += `${i + 1}. ${q}\n`;
      });
    }

    prompt += `\nRetorne APENAS um JSON válido no seguinte formato:
{
  "suggestions": [
    {
      "question_text": "Texto da pergunta",
      "question_type": "text|multiple_choice|rating|boolean",
      "options": ["opção1", "opção2"] // apenas para multiple_choice
      "reasoning": "Breve explicação do porquê desta pergunta"
    }
  ],
  "confidence": 0.85,
  "reasoning": "Explicação geral sobre as sugestões"
}`;

    prompt += `\n\nDiretrizes:\n`;
    prompt += `- Use tipos de pergunta apropriados (text para respostas abertas, multiple_choice para opções, rating para avaliações 1-5, boolean para sim/não)\n`;
    prompt += `- Para perguntas multiple_choice, forneça 3-5 opções relevantes\n`;
    prompt += `- Mantenha as perguntas claras, objetivas e relevantes ao contexto\n`;
    prompt += `- Varie os tipos de pergunta para tornar a pesquisa mais dinâmica\n`;
    prompt += `- Considere o público-alvo ao formular as perguntas\n`;

    return prompt;
  }

  /**
   * Faz o parse da resposta da IA
   */
  private parseAIResponse(content: string): AIResponse {
    try {
      // Remove possíveis caracteres extras antes e depois do JSON
      const cleanContent = content.trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da IA');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validação básica da estrutura
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Estrutura de resposta inválida: suggestions não encontrado');
      }

      // Validação das sugestões
      parsed.suggestions.forEach((suggestion: any, index: number) => {
        if (!suggestion.question_text || !suggestion.question_type) {
          throw new Error(`Sugestão ${index + 1} inválida: campos obrigatórios ausentes`);
        }
        
        const validTypes = ['text', 'multiple_choice', 'rating', 'boolean'];
        if (!validTypes.includes(suggestion.question_type)) {
          throw new Error(`Sugestão ${index + 1}: tipo de pergunta inválido`);
        }
        
        // Para multiple_choice, options é obrigatório
        if (suggestion.question_type === 'multiple_choice' && (!suggestion.options || !Array.isArray(suggestion.options))) {
          throw new Error(`Sugestão ${index + 1}: opções obrigatórias para perguntas de múltipla escolha`);
        }
      });

      return {
        suggestions: parsed.suggestions,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Sugestões geradas com base no contexto fornecido'
      };
    } catch (error) {
      console.error('Erro ao fazer parse da resposta da IA:', error);
      throw new Error(`Erro ao processar resposta da IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Converte sugestões da IA para o formato usado no sistema
   */
  convertSuggestionsToQuestions(suggestions: AIQuestionSuggestion[], startIndex: number = 0): CreateSurveyQuestionData[] {
    return suggestions.map((suggestion, index) => ({
      question_text: suggestion.question_text,
      question_type: suggestion.question_type,
      options: suggestion.options,
      is_required: false, // Por padrão, deixa como opcional
      order_index: startIndex + index
    }));
  }

  /**
   * Método para testar a conectividade com a API
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instância singleton do serviço
export const aiService = new AIService();

// Função utilitária para uso direto
export async function generateSurveyQuestions(
  surveyTitle: string,
  options: Partial<AIQuestionRequest> = {}
): Promise<CreateSurveyQuestionData[]> {
  const request: AIQuestionRequest = {
    surveyTitle,
    ...options
  };

  const response = await aiService.generateQuestionSuggestions(request);
  return aiService.convertSuggestionsToQuestions(response.suggestions);
}

// Função para gerar perguntas com fallback manual
export async function generateQuestionsWithFallback(
  surveyTitle: string,
  options: Partial<AIQuestionRequest> = {}
): Promise<{ questions: CreateSurveyQuestionData[]; isAIGenerated: boolean }> {
  try {
    const questions = await generateSurveyQuestions(surveyTitle, options);
    return { questions, isAIGenerated: true };
  } catch (error) {
    console.warn('Falha na geração por IA, usando perguntas padrão:', error);
    
    // Fallback com perguntas genéricas baseadas no título
    const fallbackQuestions: CreateSurveyQuestionData[] = [
      {
        question_text: 'Como você avalia sua experiência geral?',
        question_type: 'rating',
        is_required: true,
        order_index: 0
      },
      {
        question_text: 'O que mais chamou sua atenção?',
        question_type: 'text',
        is_required: false,
        order_index: 1
      },
      {
        question_text: 'Você recomendaria para outras pessoas?',
        question_type: 'boolean',
        is_required: true,
        order_index: 2
      },
      {
        question_text: 'Deixe seus comentários e sugestões:',
        question_type: 'text',
        is_required: false,
        order_index: 3
      }
    ];
    
    return { questions: fallbackQuestions, isAIGenerated: false };
  }
}