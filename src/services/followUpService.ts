import { Lead } from '../types/leads';
import { Notification, FollowUpRule, NotificationPriority, NotificationType } from '../types/notifications';

export interface FollowUpServiceConfig {
  checkInterval: number; // em minutos
  batchSize: number;
  maxRetries: number;
}

export class FollowUpService {
  private config: FollowUpServiceConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: FollowUpServiceConfig = {
    checkInterval: 15, // 15 minutos
    batchSize: 50,
    maxRetries: 3
  }) {
    this.config = config;
  }

  /**
   * Inicia o serviço de follow-up automático
   */
  start(): void {
    if (this.isRunning) {
      console.warn('FollowUpService já está em execução');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.processFollowUps().catch(error => {
        console.error('Erro no processamento de follow-ups:', error);
      });
    }, this.config.checkInterval * 60 * 1000);

    console.log(`FollowUpService iniciado com intervalo de ${this.config.checkInterval} minutos`);
  }

  /**
   * Para o serviço de follow-up automático
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('FollowUpService parado');
  }

  /**
   * Processa todos os follow-ups pendentes
   */
  private async processFollowUps(): Promise<void> {
    try {
      const leads = await this.getLeadsForProcessing();
      const rules = await this.getActiveFollowUpRules();
      
      if (leads.length === 0 || rules.length === 0) {
        return;
      }

      const notifications: Notification[] = [];

      for (const lead of leads) {
        const applicableRules = this.getApplicableRules(lead, rules);
        
        for (const rule of applicableRules) {
          const notification = this.createNotificationFromRule(lead, rule);
          if (notification) {
            notifications.push(notification);
          }
        }
      }

      if (notifications.length > 0) {
        await this.sendNotifications(notifications);
        console.log(`Processados ${notifications.length} follow-ups para ${leads.length} leads`);
      }
    } catch (error) {
      console.error('Erro no processamento de follow-ups:', error);
    }
  }

  /**
   * Obtém leads que precisam ser processados
   */
  private async getLeadsForProcessing(): Promise<Lead[]> {
    // Mock - em produção, isso seria uma consulta ao banco de dados
    // Buscar leads que:
    // - Não foram contatados recentemente
    // - Estão em status que permite follow-up
    // - Não têm follow-ups agendados para hoje
    
    const mockLeads: Lead[] = [
      {
        id: '1',
        company_id: 'comp1',
        name: 'João Silva',
        email: 'joao@empresa.com',
        phone: '11999999999',
        status: 'new',
        source: 'website',
        interests: ['produto-a'],
        captured_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        company_id: 'comp1',
        name: 'Maria Santos',
        email: 'maria@empresa.com',
        phone: '11888888888',
        status: 'contacted',
        source: 'fair',
        interests: ['produto-b'],
        captured_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias atrás
      }
    ];

    return mockLeads;
  }

  /**
   * Obtém regras de follow-up ativas
   */
  private async getActiveFollowUpRules(): Promise<FollowUpRule[]> {
    // Mock - em produção, isso seria uma consulta ao banco de dados
    const mockRules: FollowUpRule[] = [
      {
        id: '1',
        name: 'Follow-up Leads Novos',
        description: 'Notificar sobre leads novos após 1 dia',
        isActive: true,
        conditions: {
          status: ['new'],
          daysSinceLastContact: 1,
          source: ['website', 'fair']
        },
        actions: {
          createNotification: true,
          notificationType: 'follow_up' as NotificationType,
          priority: 'high' as NotificationPriority,
          message: 'Lead novo precisa de follow-up: {{leadName}}'
        },
        schedule: {
          frequency: 'once',
          time: '09:00'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Follow-up Leads Contatados',
        description: 'Lembrar de leads contatados após 3 dias',
        isActive: true,
        conditions: {
          status: ['contacted'],
          daysSinceLastContact: 3
        },
        actions: {
          createNotification: true,
          notificationType: 'reminder' as NotificationType,
          priority: 'medium' as NotificationPriority,
          message: 'Lembrete: Lead {{leadName}} foi contatado há 3 dias'
        },
        schedule: {
          frequency: 'once',
          time: '14:00'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return mockRules.filter(rule => rule.isActive);
  }

  /**
   * Verifica quais regras se aplicam a um lead específico
   */
  private getApplicableRules(lead: Lead, rules: FollowUpRule[]): FollowUpRule[] {
    return rules.filter(rule => this.doesRuleApplyToLead(lead, rule));
  }

  /**
   * Verifica se uma regra se aplica a um lead
   */
  private doesRuleApplyToLead(lead: Lead, rule: FollowUpRule): boolean {
    const { conditions } = rule;

    // Verificar status
    if (conditions.status && !conditions.status.includes(lead.status)) {
      return false;
    }

    // Verificar source
    if (conditions.source && !conditions.source.includes(lead.source)) {
      return false;
    }

    // Verificar dias desde último contato
    if (conditions.daysSinceLastContact !== undefined) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceUpdate < conditions.daysSinceLastContact) {
        return false;
      }
    }

    // Verificar tags/interests
    if (conditions.tags && conditions.tags.length > 0) {
      const leadInterests = lead.interests || [];
      const hasMatchingTag = conditions.tags.some(tag => 
        leadInterests.includes(tag)
      );
      
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cria uma notificação baseada em uma regra e lead
   */
  private createNotificationFromRule(lead: Lead, rule: FollowUpRule): Notification | null {
    if (!rule.actions.createNotification) {
      return null;
    }

    const message = rule.actions.message?.replace('{{leadName}}', lead.name) || 
                   `Follow-up necessário para ${lead.name}`;

    const notification: Notification = {
      id: `followup_${lead.id}_${rule.id}_${Date.now()}`,
      title: `Follow-up: ${lead.name}`,
      message,
      type: rule.actions.notificationType || 'follow_up',
      priority: rule.actions.priority || 'medium',
      status: 'unread',
      leadId: lead.id,
      ruleId: rule.id,
      createdAt: new Date().toISOString(),
      scheduledFor: this.calculateScheduledTime(rule)
    };

    return notification;
  }

  /**
   * Calcula o horário agendado para a notificação
   */
  private calculateScheduledTime(rule: FollowUpRule): string {
    const now = new Date();
    const [hours, minutes] = (rule.schedule.time || '09:00').split(':').map(Number);
    
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime.toISOString();
  }

  /**
   * Envia as notificações criadas
   */
  private async sendNotifications(notifications: Notification[]): Promise<void> {
    // Mock - em produção, isso integraria com o sistema de notificações
    // Poderia enviar para:
    // - Sistema de notificações em tempo real (WebSocket)
    // - Email
    // - Slack
    // - Push notifications
    
    for (const notification of notifications) {
      console.log('Enviando notificação:', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        leadId: notification.leadId,
        scheduledFor: notification.scheduledFor
      });
      
      // Simular envio da notificação
      await this.simulateNotificationDelivery(notification);
    }
  }

  /**
   * Simula o envio de uma notificação
   */
  private async simulateNotificationDelivery(notification: Notification): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✓ Notificação ${notification.id} enviada com sucesso`);
        resolve();
      }, 100);
    });
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats(): {
    isRunning: boolean;
    checkInterval: number;
    lastProcessedAt: string | null;
  } {
    return {
      isRunning: this.isRunning,
      checkInterval: this.config.checkInterval,
      lastProcessedAt: null // TODO: implementar tracking de última execução
    };
  }

  /**
   * Força o processamento imediato de follow-ups
   */
  async forceProcess(): Promise<void> {
    console.log('Forçando processamento de follow-ups...');
    await this.processFollowUps();
  }
}

// Instância singleton do serviço
export const followUpService = new FollowUpService();

// Auto-iniciar o serviço em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  followUpService.start();
  console.log('FollowUpService iniciado automaticamente em modo desenvolvimento');
}