// Serviço de IA específico para recomendação de perguntas de leads
export interface LeadQuestionSuggestion {
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  options?: string[];
  reasoning?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'qualification' | 'interest' | 'contact' | 'demographic';
}

export interface LeadAIRequest {
  companyName?: string;
  industry?: string;
  targetAudience?: string;
  eventType?: string;
  questionCount?: number;
  existingQuestions?: string[];
  focusAreas?: string[]; // Ex: ['budget', 'timeline', 'decision_maker']
}

export interface LeadAIResponse {
  suggestions: LeadQuestionSuggestion[];
  confidence: number;
  reasoning: string;
}

class LeadAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Gera sugestões de perguntas para qualificação de leads
   */
  async generateLeadQuestions(request: LeadAIRequest): Promise<LeadAIResponse> {
    if (!this.apiKey) {
      // Retorna perguntas padrão se não houver API key
      return this.getFallbackQuestions(request);
    }

    try {
      const prompt = this.buildLeadPrompt(request);
      
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
              content: 'Você é um especialista em captação e qualificação de leads para eventos corporativos e feiras. Sua tarefa é sugerir perguntas estratégicas que ajudem a qualificar leads de forma eficiente. Sempre responda em formato JSON válido.'
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
        console.warn('Erro na API OpenAI, usando fallback');
        return this.getFallbackQuestions(request);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return this.getFallbackQuestions(request);
      }

      return this.parseLeadAIResponse(content);
    } catch (error) {
      console.warn('Erro ao gerar sugestões de perguntas, usando fallback:', error);
      return this.getFallbackQuestions(request);
    }
  }

  /**
   * Constrói o prompt específico para perguntas de leads
   */
  private buildLeadPrompt(request: LeadAIRequest): string {
    const {
      companyName,
      industry,
      targetAudience,
      eventType,
      questionCount = 5,
      existingQuestions = [],
      focusAreas = []
    } = request;

    let prompt = `Crie ${questionCount} perguntas estratégicas para qualificação de leads em eventos corporativos com as seguintes características:\n\n`;
    
    if (companyName) {
      prompt += `Empresa: ${companyName}\n`;
    }
    
    if (industry) {
      prompt += `Setor/Indústria: ${industry}\n`;
    }
    
    if (targetAudience) {
      prompt += `Público-alvo: ${targetAudience}\n`;
    }
    
    if (eventType) {
      prompt += `Tipo de evento: ${eventType}\n`;
    }

    if (focusAreas.length > 0) {
      prompt += `Áreas de foco: ${focusAreas.join(', ')}\n`;
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
      "options": ["opção1", "opção2"], // apenas para multiple_choice
      "reasoning": "Por que esta pergunta é importante para qualificar o lead",
      "priority": "high|medium|low",
      "category": "qualification|interest|contact|demographic"
    }
  ],
  "confidence": 0.85,
  "reasoning": "Explicação geral sobre as sugestões"
}`;

    prompt += `\n\nDiretrizes específicas para leads:\n`;
    prompt += `- Priorize perguntas que identifiquem o potencial de compra\n`;
    prompt += `- Inclua perguntas sobre orçamento, timeline e tomada de decisão\n`;
    prompt += `- Use perguntas de múltipla escolha para facilitar respostas rápidas\n`;
    prompt += `- Categorize as perguntas: qualification (orçamento, autoridade), interest (necessidades), contact (dados), demographic (perfil)\n`;
    prompt += `- Mantenha as perguntas diretas e objetivas para ambiente de feira\n`;
    prompt += `- Considere perguntas que ajudem a priorizar o follow-up\n`;

    return prompt;
  }

  /**
   * Parse da resposta da IA para perguntas de leads
   */
  private parseLeadAIResponse(content: string): LeadAIResponse {
    try {
      const cleanContent = content.trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da IA');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Estrutura de resposta inválida');
      }

      // Validação das sugestões
      parsed.suggestions.forEach((suggestion: any, index: number) => {
        if (!suggestion.question_text || !suggestion.question_type) {
          throw new Error(`Sugestão ${index + 1} inválida`);
        }
        
        // Define valores padrão se não fornecidos
        suggestion.priority = suggestion.priority || 'medium';
        suggestion.category = suggestion.category || 'qualification';
      });

      return {
        suggestions: parsed.suggestions,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Sugestões geradas para qualificação de leads'
      };
    } catch (error) {
      console.warn('Erro ao fazer parse da resposta da IA, usando fallback');
      return this.getFallbackQuestions({});
    }
  }

  /**
   * Retorna perguntas padrão quando a IA não está disponível
   */
  private getFallbackQuestions(request: LeadAIRequest): LeadAIResponse {
    const fallbackSuggestions: LeadQuestionSuggestion[] = [
      {
        question_text: 'Qual é o seu principal interesse em nossos produtos/serviços?',
        question_type: 'multiple_choice',
        options: [
          'Redução de custos',
          'Aumento de produtividade',
          'Melhoria da qualidade',
          'Inovação tecnológica',
          'Outro'
        ],
        reasoning: 'Identifica a principal motivação do lead',
        priority: 'high',
        category: 'interest'
      },
      {
        question_text: 'Qual é o seu orçamento previsto para este tipo de solução?',
        question_type: 'multiple_choice',
        options: [
          'Até R$ 10.000',
          'R$ 10.000 - R$ 50.000',
          'R$ 50.000 - R$ 100.000',
          'Acima de R$ 100.000',
          'Ainda não definido'
        ],
        reasoning: 'Qualifica o potencial financeiro do lead',
        priority: 'high',
        category: 'qualification'
      },
      {
        question_text: 'Quando vocês pretendem implementar uma solução?',
        question_type: 'multiple_choice',
        options: [
          'Imediatamente',
          'Nos próximos 3 meses',
          'Em 6 meses',
          'No próximo ano',
          'Ainda estamos avaliando'
        ],
        reasoning: 'Identifica a urgência e timeline do projeto',
        priority: 'high',
        category: 'qualification'
      },
      {
        question_text: 'Você é o responsável pela decisão de compra?',
        question_type: 'multiple_choice',
        options: [
          'Sim, sou o decisor final',
          'Sou um dos decisores',
          'Influencio na decisão',
          'Apenas coleto informações',
          'Outro'
        ],
        reasoning: 'Identifica o nível de autoridade do lead',
        priority: 'high',
        category: 'qualification'
      },
      {
        question_text: 'Como você avalia a prioridade deste projeto para sua empresa?',
        question_type: 'rating',
        reasoning: 'Mede o nível de prioridade e urgência',
        priority: 'medium',
        category: 'qualification'
      }
    ];

    return {
      suggestions: fallbackSuggestions,
      confidence: 0.7,
      reasoning: 'Perguntas padrão para qualificação de leads em eventos corporativos'
    };
  }

  /**
   * Testa a conectividade com a API
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
export const leadAIService = new LeadAIService();

// Função utilitária para gerar perguntas de leads
export async function generateLeadQuestions(
  options: LeadAIRequest = {}
): Promise<LeadQuestionSuggestion[]> {
  const response = await leadAIService.generateLeadQuestions(options);
  return response.suggestions;
}

// Função para obter perguntas categorizadas
export async function getQuestionsbyCategory(
  category: 'qualification' | 'interest' | 'contact' | 'demographic',
  options: LeadAIRequest = {}
): Promise<LeadQuestionSuggestion[]> {
  const allQuestions = await generateLeadQuestions(options);
  return allQuestions.filter(q => q.category === category);
}