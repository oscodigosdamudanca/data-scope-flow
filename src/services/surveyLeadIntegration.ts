import type { SubmitSurveyResponseData } from '@/types/surveys';
import type { CreateLeadData } from '@/types/leads';

/**
 * Serviço para integração automática entre respostas de surveys e captação de leads
 */
export class SurveyLeadIntegrationService {
  /**
   * Cria um lead automaticamente a partir de uma resposta de survey
   */
  static async createLeadFromSurvey(
    surveyResponse: SubmitSurveyResponseData,
    companyId: string
  ): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      // Cria um novo lead
      const leadData: CreateLeadData = {
        name: surveyResponse.respondent_name || 'Lead do Survey',
        email: surveyResponse.respondent_email || '',
        phone: surveyResponse.respondent_phone || '',
        company: surveyResponse.respondent_company || '',
        source: 'survey',
        interests: this.extractInterestsFromResponses(surveyResponse.responses),
        notes: `Lead gerado automaticamente do survey\nRespostas: ${JSON.stringify(surveyResponse.responses, null, 2)}`
      };

      // Em uma implementação real, aqui você salvaria no Supabase
      const newLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { success: true, leadId: newLead.id };
    } catch (error) {
      console.error('Erro ao criar lead do survey:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Extrai interesses das respostas do survey
   */
  private static extractInterestsFromResponses(responses: Record<string, any>): string[] {
    const interests: string[] = [];
    const keywords = ['tecnologia', 'marketing', 'vendas', 'produto', 'design'];
    
    Object.values(responses).forEach(answer => {
      if (typeof answer === 'string') {
        keywords.forEach(keyword => {
          if (answer.toLowerCase().includes(keyword)) {
            interests.push(keyword);
          }
        });
      }
    });

    return [...new Set(interests)]; // Remove duplicatas
  }

  /**
   * Processa resposta de survey (método de compatibilidade)
   */
  static async processSurveyResponse(
    surveyResponse: SubmitSurveyResponseData,
    companyId: string
  ): Promise<{ success: boolean; leadId?: string; error?: string }> {
    return this.createLeadFromSurvey(surveyResponse, companyId);
  }
}