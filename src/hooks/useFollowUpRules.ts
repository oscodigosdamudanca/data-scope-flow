import { useState, useEffect } from 'react';
import { 
  FollowUpRule, 
  CreateFollowUpRuleData, 
  UpdateFollowUpRuleData 
} from '../types/notifications';
import { useCompany } from '../contexts/CompanyContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Lead } from '../types/leads';

interface UseFollowUpRulesReturn {
  rules: FollowUpRule[];
  loading: boolean;
  error: string | null;
  createRule: (data: CreateFollowUpRuleData) => Promise<FollowUpRule>;
  updateRule: (id: string, data: UpdateFollowUpRuleData) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  testRule: (ruleId: string, lead: Lead) => boolean;
  processLeadForRules: (lead: Lead) => Promise<void>;
  loadRules: () => Promise<void>;
}

export function useFollowUpRules(): UseFollowUpRulesReturn {
  const [rules, setRules] = useState<FollowUpRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompany();
  const { createNotification } = useNotifications();

  // Mock data para desenvolvimento
  const mockRules: FollowUpRule[] = [
    {
      id: '1',
      company_id: currentCompany?.id || '1',
      name: 'Follow-up Leads Novos',
      description: 'Lembrete para contatar leads novos após 24 horas',
      is_active: true,
      trigger_conditions: {
        lead_status: ['novo', 'contato_inicial'],
        days_since_created: 1
      },
      notification_config: {
        type: 'follow_up_reminder',
        priority: 'medium',
        title_template: 'Follow-up necessário: {{lead_name}}',
        message_template: 'Lead {{lead_name}} foi criado há {{days}} dias e precisa de contato',
        action_url_template: '/leads/{{lead_id}}'
      },
      schedule_config: {
        delay_hours: 24,
        business_hours_only: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      company_id: currentCompany?.id || '1',
      name: 'Follow-up Leads Qualificados',
      description: 'Lembrete urgente para leads qualificados sem contato há 3 dias',
      is_active: true,
      trigger_conditions: {
        lead_status: ['qualificado', 'interessado'],
        days_since_last_contact: 3
      },
      notification_config: {
        type: 'follow_up_overdue',
        priority: 'high',
        title_template: 'Follow-up URGENTE: {{lead_name}}',
        message_template: 'Lead qualificado {{lead_name}} está sem contato há {{days}} dias!',
        action_url_template: '/leads/{{lead_id}}'
      },
      schedule_config: {
        delay_hours: 0,
        repeat_interval_hours: 24,
        max_repeats: 3,
        business_hours_only: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      company_id: currentCompany?.id || '1',
      name: 'Follow-up Leads VIP',
      description: 'Acompanhamento especial para leads com tag VIP',
      is_active: true,
      trigger_conditions: {
        tags: ['VIP', 'Premium'],
        days_since_last_contact: 1
      },
      notification_config: {
        type: 'follow_up_reminder',
        priority: 'urgent',
        title_template: 'Lead VIP precisa de atenção: {{lead_name}}',
        message_template: 'Lead VIP {{lead_name}} está há {{days}} dias sem contato',
        assign_to_user: 'manager',
        action_url_template: '/leads/{{lead_id}}'
      },
      schedule_config: {
        delay_hours: 2,
        repeat_interval_hours: 12,
        max_repeats: 5,
        business_hours_only: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const loadRules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      setRules(mockRules);
    } catch (err) {
      setError('Erro ao carregar regras de follow-up');
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (data: CreateFollowUpRuleData): Promise<FollowUpRule> => {
    const newRule: FollowUpRule = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setRules(prev => [...prev, newRule]);
    return newRule;
  };

  const updateRule = async (id: string, data: UpdateFollowUpRuleData) => {
    setRules(prev => prev.map(rule => 
      rule.id === id 
        ? { ...rule, ...data, updated_at: new Date().toISOString() }
        : rule
    ));
  };

  const deleteRule = async (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const toggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (rule) {
      await updateRule(id, { is_active: !rule.is_active });
    }
  };

  // Função para testar se um lead atende às condições de uma regra
  const testRule = (ruleId: string, lead: Lead): boolean => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.is_active) return false;

    const conditions = rule.trigger_conditions;
    const now = new Date();
    const createdAt = new Date(lead.created_at);
    const lastContact = new Date(lead.updated_at); // Usar updated_at como proxy para último contato

    // Verificar status do lead
    if (conditions.lead_status && conditions.lead_status.length > 0) {
      if (!conditions.lead_status.includes(lead.status)) {
        return false;
      }
    }

    // Verificar fonte do lead
    if (conditions.lead_source && conditions.lead_source.length > 0) {
      if (!conditions.lead_source.includes(lead.source)) {
        return false;
      }
    }

    // Verificar dias desde criação
    if (conditions.days_since_created !== undefined) {
      const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated < conditions.days_since_created) {
        return false;
      }
    }

    // Verificar dias desde último contato
    if (conditions.days_since_last_contact !== undefined) {
      const daysSinceLastContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastContact < conditions.days_since_last_contact) {
        return false;
      }
    }

    // Verificar tags (usando interests como proxy para tags)
    if (conditions.tags && conditions.tags.length > 0) {
      const leadInterests = lead.interests || [];
      const hasRequiredTag = conditions.tags.some(tag => 
        leadInterests.includes(tag)
      );
      if (!hasRequiredTag) {
        return false;
      }
    }

    return true;
  };

  // Função para processar um lead contra todas as regras ativas
  const processLeadForRules = async (lead: Lead) => {
    const activeRules = rules.filter(rule => rule.is_active);
    
    for (const rule of activeRules) {
      if (testRule(rule.id, lead)) {
        // Criar notificação baseada na regra
        const notification = {
          company_id: rule.company_id,
          user_id: rule.notification_config.assign_to_user || undefined,
          type: rule.notification_config.type,
          priority: rule.notification_config.priority,
          title: interpolateTemplate(rule.notification_config.title_template, lead),
          message: interpolateTemplate(rule.notification_config.message_template, lead),
          lead_id: lead.id,
          action_url: rule.notification_config.action_url_template 
            ? interpolateTemplate(rule.notification_config.action_url_template, lead)
            : undefined,
          data: {
            rule_id: rule.id,
            rule_name: rule.name
          }
        };

        // Verificar se deve atrasar a notificação
        if (rule.schedule_config.delay_hours && rule.schedule_config.delay_hours > 0) {
          const scheduledFor = new Date();
          scheduledFor.setHours(scheduledFor.getHours() + rule.schedule_config.delay_hours);
          (notification as any).scheduled_for = scheduledFor.toISOString();
        }

        await createNotification(notification);
      }
    }
  };

  // Função auxiliar para interpolar templates
  const interpolateTemplate = (template: string, lead: Lead): string => {
    const now = new Date();
    const createdAt = new Date(lead.created_at);
    const lastContact = new Date(lead.updated_at); // Usar updated_at como proxy para último contato
    
    const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceLastContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

    return template
      .replace(/{{lead_name}}/g, lead.name)
      .replace(/{{lead_id}}/g, lead.id)
      .replace(/{{lead_email}}/g, lead.email || '')
      .replace(/{{lead_phone}}/g, lead.phone || '')
      .replace(/{{lead_status}}/g, lead.status)
      .replace(/{{lead_source}}/g, lead.source)
      .replace(/{{days_since_created}}/g, daysSinceCreated.toString())
      .replace(/{{days_since_last_contact}}/g, daysSinceLastContact.toString())
      .replace(/{{days}}/g, Math.max(daysSinceCreated, daysSinceLastContact).toString());
  };

  // Carregar regras quando o componente montar
  useEffect(() => {
    if (currentCompany) {
      loadRules();
    }
  }, [currentCompany]);

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    testRule,
    processLeadForRules,
    loadRules
  };
}