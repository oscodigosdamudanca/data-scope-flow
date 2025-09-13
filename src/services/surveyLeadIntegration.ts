import type { SubmitSurveyResponseData } from '@/types/surveys';
import type { CreateLeadData } from '@/types/leads';

/**
 * Serviço para integração automática entre respostas de surveys e captação de leads
 * NOTA: Implementação temporária usando localStorage até a tabela 'leads' ser criada no Supabase
 */
export class SurveyLeadIntegrationService {
  /**
   * Cria um lead automaticamente a partir de uma resposta de survey
   */
  static async createLeadFromSurveyResponse(
    surveyResponse: SubmitSurveyResponseData
  ): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      // Verifica se já existe um lead com este email
      const existingLead = this.findExistingLead(surveyResponse.respondent_email);
      
      if (existingLead) {
        // Atualiza o lead existente com novas informações
        await this.updateLeadFromSurvey(existingLead.id, surveyResponse);
        return { success: true, leadId: existingLead.id };
      }

      // Cria um novo lead
      const leadData: CreateLeadData = {
        name: surveyResponse.respondent_name || 'Lead do Survey',
        email: surveyResponse.respondent_email,
        phone: surveyResponse.respondent_phone || '',
        company: surveyResponse.respondent_company || '',
        source: 'survey',
        status: 'new',
        tags: ['survey-generated'],
        notes: `Lead gerado automaticamente do survey: ${surveyResponse.survey_id}\nRespostas: ${JSON.stringify(surveyResponse.responses, null, 2)}`
      };

      const newLead = this.createLead(leadData);
      
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
   * Enriquece dados de lead com informações de survey
   */
  static async enrichLeadWithSurveyData(
    leadId: string,
    surveyResponse: SubmitSurveyResponseData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const leads = this.getLeadsFromStorage();
      const leadIndex = leads.findIndex(lead => lead.id === leadId);
      
      if (leadIndex === -1) {
        return { success: false, error: 'Lead não encontrado' };
      }

      const currentLead = leads[leadIndex];
      
      // Extrai insights das respostas do survey
      const surveyInsights = this.extractSurveyInsights(surveyResponse.responses);
      
      // Atualiza o lead com os insights
      const updatedLead = {
        ...currentLead,
        interests: [...(currentLead.interests || []), ...surveyInsights.interests],
        tags: [...(currentLead.tags || []), ...surveyInsights.tags],
        notes: `${currentLead.notes || ''}\n\n--- Survey Insights ---\n${surveyInsights.notes}`
      };

      leads[leadIndex] = updatedLead;
      localStorage.setItem('leads', JSON.stringify(leads));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao enriquecer lead:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Métodos auxiliares para localStorage (temporário)
   */
  private static getLeadsFromStorage(): any[] {
    const stored = localStorage.getItem('leads');
    return stored ? JSON.parse(stored) : [];
  }

  private static findExistingLead(email: string): any | null {
    const leads = this.getLeadsFromStorage();
    return leads.find(lead => lead.email === email) || null;
  }

  private static createLead(leadData: CreateLeadData): any {
    const leads = this.getLeadsFromStorage();
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));
    
    return newLead;
  }

  private static async updateLeadFromSurvey(leadId: string, surveyResponse: SubmitSurveyResponseData): Promise<void> {
    const leads = this.getLeadsFromStorage();
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex !== -1) {
      const insights = this.extractSurveyInsights(surveyResponse.responses);
      leads[leadIndex] = {
        ...leads[leadIndex],
        updated_at: new Date().toISOString(),
        notes: `${leads[leadIndex].notes || ''}\n\nNovo survey respondido em ${new Date().toLocaleDateString()}\nRespostas: ${JSON.stringify(surveyResponse.responses, null, 2)}`
      };
      
      localStorage.setItem('leads', JSON.stringify(leads));
    }
  }

  private static extractSurveyInsights(responses: Record<string, any>): {
    interests: string[];
    tags: string[];
    notes: string;
  } {
    const interests: string[] = [];
    const tags: string[] = ['survey-respondent'];
    const notes: string[] = [];

    // Analisa as respostas para extrair insights
    Object.entries(responses).forEach(([question, answer]) => {
      if (typeof answer === 'string') {
        // Detecta possíveis interesses baseados em palavras-chave
        const keywords = ['tecnologia', 'marketing', 'vendas', 'produto', 'design'];
        keywords.forEach(keyword => {
          if (answer.toLowerCase().includes(keyword)) {
            interests.push(keyword);
            tags.push(`interesse-${keyword}`);
          }
        });
      }
      
      notes.push(`${question}: ${JSON.stringify(answer)}`);
    });

    return {
      interests: [...new Set(interests)], // Remove duplicatas
      tags: [...new Set(tags)],
      notes: notes.join('\n')
    };
  }
}