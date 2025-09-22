import { useContext } from 'react';
import { NotificationsContext, NotificationsContextType } from '@/contexts/NotificationsContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { CreateNotificationData, Notification, NotificationType } from '@/types/notifications';
import { Lead } from '@/types/leads';

export function useNotifications() {
  const context = useContext<NotificationsContextType | null>(NotificationsContext);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  // Função para criar notificação de lead
  const createLeadNotification = (
    lead: Lead, 
    type: NotificationType = 'lead_created',
    title?: string,
    message?: string
  ) => {
    if (!currentCompany?.id) {
      console.warn('Empresa atual não definida para criação de notificação');
      return null;
    }

    let notificationTitle = title;
    let notificationMessage = message;

    // Definir títulos e mensagens padrão baseados no tipo
    if (!notificationTitle || !notificationMessage) {
      switch (type) {
        case 'lead_created':
          notificationTitle = 'Novo lead capturado';
          notificationMessage = `${lead.name} foi adicionado como novo lead`;
          break;
        case 'lead_updated':
          notificationTitle = 'Lead atualizado';
          notificationMessage = `Informações do lead ${lead.name} foram atualizadas`;
          break;
        case 'lead_status_changed':
          notificationTitle = 'Status de lead alterado';
          notificationMessage = `O status do lead ${lead.name} foi alterado para ${lead.status}`;
          break;
        case 'lead_converted':
          notificationTitle = 'Lead convertido!';
          notificationMessage = `O lead ${lead.name} foi convertido com sucesso`;
          break;
        case 'lead_lost':
          notificationTitle = 'Lead perdido';
          notificationMessage = `O lead ${lead.name} foi marcado como perdido`;
          break;
        default:
          notificationTitle = notificationTitle || 'Notificação de lead';
          notificationMessage = notificationMessage || `Atualização sobre o lead ${lead.name}`;
      }
    }

    const notificationData: CreateNotificationData = {
      company_id: currentCompany.id,
      user_id: user?.id,
      type,
      priority: type === 'lead_converted' || type === 'lead_lost' ? 'high' : 'medium',
      title: notificationTitle,
      message: notificationMessage,
      lead_id: lead.id,
      action_url: `/leads/${lead.id}`
    };

    try {
      // Adicionar notificação ao contexto
      const notification = context.addNotification(notificationData as Notification);
      
      // Exibir toast para notificações importantes
      if (['lead_created', 'lead_converted', 'lead_lost'].includes(type)) {
        toast({
          title: notificationTitle,
          description: notificationMessage,
          variant: type === 'lead_lost' ? 'destructive' : 'default',
        });
      }
      
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  };

  // Função para notificar sobre lead criado via formulário Turbo
  const notifyTurboLeadCreated = (lead: Lead) => {
    return createLeadNotification(
      lead,
      'lead_created',
      'Novo lead via Formulário Turbo',
      `${lead.name} foi capturado através do Formulário Turbo`
    );
  };

  return {
    ...context,
    createLeadNotification,
    notifyTurboLeadCreated
  };
}