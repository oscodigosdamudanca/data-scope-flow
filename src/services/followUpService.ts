import { supabase } from '../integrations/supabase/client';
import { Lead } from '../types/leads';
import { Notification, FollowUpRule, NotificationPriority, NotificationType } from '../types/notifications';

export interface FollowUpServiceConfig {
  checkInterval: number; // em minutos
  batchSize: number;
  maxRetries: number;
}

export interface FollowUpServiceStats {
  isRunning: boolean;
  checkInterval: number;
  lastProcessedAt: string | null;
  totalNotificationsSent: number;
  totalLeadsProcessed: number;
}

export class FollowUpService {
  private config: FollowUpServiceConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private stats: FollowUpServiceStats = {
    isRunning: false,
    checkInterval: 15,
    lastProcessedAt: null,
    totalNotificationsSent: 0,
    totalLeadsProcessed: 0
  };

  constructor(config: FollowUpServiceConfig = {
    checkInterval: 15, // 15 minutos
    batchSize: 50,
    maxRetries: 3
  }) {
    this.config = config;
    this.stats.checkInterval = config.checkInterval;
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
    this.stats.isRunning = true;
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
    this.stats.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('FollowUpService parado');
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats(): FollowUpServiceStats {
    return { ...this.stats };
  }

  /**
   * Atualiza configurações do serviço
   */
  updateConfig(newConfig: Partial<FollowUpServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.checkInterval) {
      this.stats.checkInterval = newConfig.checkInterval;
      
      // Reiniciar com novo intervalo se estiver rodando
      if (this.isRunning) {
        this.stop();
        this.start();
      }
    }
  }

  /**
   * Força o processamento imediato de follow-ups
   */
  async forceProcess(): Promise<void> {
    console.log('Forçando processamento de follow-ups...');
    await this.processFollowUps();
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

      const now = new Date();
      let processedLeads = 0;
      let sentNotifications = 0;

      for (const lead of leads) {
        const applicableRules = await this.getApplicableRules(lead, rules, now);
        
        for (const rule of applicableRules) {
          const notification = await this.createNotificationFromRule(lead, rule);
          if (notification) {
            await this.sendNotification(notification);
            sentNotifications++;
          }
        }
        
        if (applicableRules.length > 0) {
          processedLeads++;
        }
      }

      this.stats.lastProcessedAt = now.toISOString();
      this.stats.totalLeadsProcessed += processedLeads;
      this.stats.totalNotificationsSent += sentNotifications;

      if (sentNotifications > 0) {
        console.log(`Processados ${sentNotifications} follow-ups para ${processedLeads} leads`);
      }
    } catch (error) {
      console.error('Erro no processamento de follow-ups:', error);
    }
  }

  /**
   * Obtém leads que precisam ser processados
   */
  private async getLeadsForProcessing(): Promise<Lead[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .in('status', ['new', 'contacted', 'qualified'])
        .order('created_at', { ascending: false })
        .limit(this.config.batchSize);

      if (error) throw error;
      return leads || [];
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return [];
    }
  }

  /**
   * Obtém regras de follow-up ativas
   */
  private async getActiveFollowUpRules(): Promise<FollowUpRule[]> {
    try {
      const { data: rules, error } = await supabase
        .from('follow_up_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return rules || [];
    } catch (error) {
      console.error('Erro ao buscar regras:', error);
      return [];
    }
  }

  /**
   * Verifica quais regras se aplicam a um lead específico
   */
  private async getApplicableRules(lead: Lead, rules: FollowUpRule[], now: Date): Promise<FollowUpRule[]> {
    const applicableRules: FollowUpRule[] = [];

    for (const rule of rules) {
      if (await this.doesRuleApplyToLead(lead, rule, now)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  /**
   * Verifica se uma regra se aplica a um lead
   */
  private async doesRuleApplyToLead(lead: Lead, rule: FollowUpRule, now: Date): boolean {
    const conditions = rule.trigger_conditions;

    // Verificar condições do status
    if (conditions.lead_status && !conditions.lead_status.includes(lead.status)) {
      return false;
    }

    // Verificar condições da fonte
    if (conditions.lead_source && !conditions.lead_source.includes(lead.source)) {
      return false;
    }

    // Verificar condições das tags
    if (conditions.tags && conditions.tags.length > 0) {
      const hasMatchingTag = conditions.tags.some(tag => 
        lead.tags?.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Verificar dias desde criação
    if (conditions.days_since_created) {
      const daysSinceCreated = Math.floor(
        (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated < conditions.days_since_created) {
        return false;
      }
    }

    // Verificar dias desde último contato
    if (conditions.days_since_last_contact) {
      const lastContactDate = lead.last_contact_date 
        ? new Date(lead.last_contact_date)
        : new Date(lead.created_at);
      
      const daysSinceLastContact = Math.floor(
        (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastContact < conditions.days_since_last_contact) {
        return false;
      }
    }

    // Verificar se já existe notificação para este lead e regra
    const existingNotification = await supabase
      .from('notifications')
      .select('id')
      .eq('company_id', lead.company_id)
      .eq('lead_id', lead.id)
      .eq('type', rule.notification_config.type)
      .eq('status', 'unread')
      .single();

    if (existingNotification.data) {
      return false; // Já existe notificação pendente
    }

    return true;
  }

  /**
   * Cria uma notificação baseada em uma regra e lead
   */
  private async createNotificationFromRule(lead: Lead, rule: FollowUpRule): Promise<Notification | null> {
    try {
      const notification = {
        company_id: lead.company_id,
        user_id: rule.notification_config.assign_to_user || null,
        type: rule.notification_config.type,
        priority: rule.notification_config.priority,
        title: rule.notification_config.title_template?.replace('{{leadName}}', lead.name) || `Follow-up: ${lead.name}`,
        message: rule.notification_config.message_template?.replace('{{leadName}}', lead.name) || `Lead ${lead.name} precisa de follow-up`,
        lead_id: lead.id,
        action_url: rule.notification_config.action_url_template?.replace('{{leadId}}', lead.id),
        scheduled_for: this.calculateScheduledTime(rule.schedule_config),
      };

      return notification as Notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  /**
   * Calcula o horário agendado para a notificação
   */
  private calculateScheduledTime(schedule_config: any): Date {
    const now = new Date();
    const delayHours = schedule_config.delay_hours || 0;
    const scheduledTime = new Date(now.getTime() + delayHours * 60 * 60 * 1000);
    
    // Verificar se deve processar apenas em horário comercial
    if (schedule_config.business_hours_only) {
      const hour = scheduledTime.getHours();
      if (hour < 8 || hour > 18) {
        // Agendar para o próximo dia útil às 9h
        const nextDay = new Date(scheduledTime);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(9, 0, 0, 0);
        return nextDay;
      }
    }
    
    return scheduledTime;
  }

  /**
   * Envia uma notificação
   */
  private async sendNotification(notification: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      if (error) throw error;
      
      console.log('✓ Notificação enviada:', notification.title);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  /**
   * Processa notificações agendadas
   */
  private async processScheduledNotifications(): Promise<void> {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'unread')
        .not('scheduled_for', 'is', null)
        .lte('scheduled_for', new Date().toISOString());

      if (error) throw error;

      for (const notification of notifications || []) {
        const scheduledTime = new Date(notification.scheduled_for);
        
        if (scheduledTime <= new Date()) {
          console.log('Processando notificação agendada:', notification.title);
          // Aqui você pode implementar lógica adicional como envio por email, webhook, etc.
        }
      }
    } catch (error) {
      console.error('Erro ao processar notificações agendadas:', error);
    }
  }
}

// Instância singleton do serviço
export const followUpService = new FollowUpService();

// Auto-iniciar o serviço em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  followUpService.start();
  console.log('FollowUpService iniciado automaticamente em modo desenvolvimento');
}