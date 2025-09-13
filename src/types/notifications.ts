export type NotificationType = 
  | 'lead_created'
  | 'lead_updated'
  | 'lead_status_changed'
  | 'follow_up_reminder'
  | 'follow_up_overdue'
  | 'lead_converted'
  | 'lead_lost'
  | 'system_alert'
  | 'custom';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  company_id: string;
  user_id?: string; // null para notificações globais da empresa
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  data?: Record<string, any>; // dados adicionais específicos do tipo
  lead_id?: string; // referência ao lead relacionado
  action_url?: string; // URL para ação relacionada
  scheduled_for?: string; // para notificações agendadas
  expires_at?: string; // data de expiração
  created_at: string;
  updated_at: string;
  read_at?: string;
}

export interface CreateNotificationData {
  company_id: string;
  user_id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  lead_id?: string;
  action_url?: string;
  scheduled_for?: string;
  expires_at?: string;
}

export interface UpdateNotificationData {
  status?: NotificationStatus;
  read_at?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  user_id?: string;
  lead_id?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Configurações de follow-up automático
export interface FollowUpRule {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_conditions: {
    lead_status?: string[];
    lead_source?: string[];
    days_since_created?: number;
    days_since_last_contact?: number;
    tags?: string[];
  };
  notification_config: {
    type: NotificationType;
    priority: NotificationPriority;
    title_template: string;
    message_template: string;
    assign_to_user?: string; // user_id específico ou null para todos
    action_url_template?: string;
  };
  schedule_config: {
    delay_hours?: number; // atraso antes de enviar
    repeat_interval_hours?: number; // intervalo para repetir
    max_repeats?: number; // máximo de repetições
    business_hours_only?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateFollowUpRuleData {
  company_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_conditions: FollowUpRule['trigger_conditions'];
  notification_config: FollowUpRule['notification_config'];
  schedule_config: FollowUpRule['schedule_config'];
}

export interface UpdateFollowUpRuleData {
  name?: string;
  description?: string;
  is_active?: boolean;
  trigger_conditions?: FollowUpRule['trigger_conditions'];
  notification_config?: FollowUpRule['notification_config'];
  schedule_config?: FollowUpRule['schedule_config'];
}

// Configurações de notificação do usuário
export interface NotificationSettings {
  id: string;
  user_id: string;
  company_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_types: {
    [K in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
      in_app: boolean;
    };
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    timezone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationSettingsData {
  email_notifications?: boolean;
  push_notifications?: boolean;
  in_app_notifications?: boolean;
  notification_types?: Partial<NotificationSettings['notification_types']>;
  quiet_hours?: NotificationSettings['quiet_hours'];
}