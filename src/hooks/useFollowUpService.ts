import { useState, useEffect, useCallback } from 'react';
import { followUpService, FollowUpServiceConfig } from '../services/followUpService';
import { useNotifications } from '../contexts/NotificationsContext';

export interface FollowUpServiceStats {
  isRunning: boolean;
  checkInterval: number;
  lastProcessedAt: string | null;
  totalNotificationsSent: number;
  totalLeadsProcessed: number;
}

export interface UseFollowUpServiceReturn {
  stats: FollowUpServiceStats;
  isLoading: boolean;
  error: string | null;
  startService: () => void;
  stopService: () => void;
  forceProcess: () => Promise<void>;
  updateConfig: (config: Partial<FollowUpServiceConfig>) => void;
  refreshStats: () => void;
}

/**
 * Hook para gerenciar o serviço de follow-up automático
 */
export function useFollowUpService(): UseFollowUpServiceReturn {
  const { addNotification } = useNotifications();
  const [stats, setStats] = useState<FollowUpServiceStats>({
    isRunning: false,
    checkInterval: 15,
    lastProcessedAt: null,
    totalNotificationsSent: 0,
    totalLeadsProcessed: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza as estatísticas do serviço
   */
  const refreshStats = useCallback(() => {
    try {
      const serviceStats = followUpService.getStats();
      setStats(prev => ({
        ...prev,
        isRunning: serviceStats.isRunning,
        checkInterval: serviceStats.checkInterval,
        lastProcessedAt: serviceStats.lastProcessedAt
      }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter estatísticas');
    }
  }, []);

  /**
   * Inicia o serviço de follow-up
   */
  const startService = useCallback(() => {
    try {
      setIsLoading(true);
      followUpService.start();
      
      // Adicionar notificação de sucesso
      addNotification({
        id: `service_started_${Date.now()}`,
        title: 'Serviço de Follow-up Iniciado',
        message: 'O sistema de follow-up automático foi iniciado com sucesso',
        type: 'system_alert',
        priority: 'low',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      
      refreshStats();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar serviço';
      setError(errorMessage);
      
      // Adicionar notificação de erro
      addNotification({
        id: `service_error_${Date.now()}`,
        title: 'Erro no Serviço de Follow-up',
        message: errorMessage,
        type: 'system',
        priority: 'high',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, refreshStats]);

  /**
   * Para o serviço de follow-up
   */
  const stopService = useCallback(() => {
    try {
      setIsLoading(true);
      followUpService.stop();
      
      // Adicionar notificação de parada
      addNotification({
        id: `service_stopped_${Date.now()}`,
        title: 'Serviço de Follow-up Parado',
        message: 'O sistema de follow-up automático foi parado',
        type: 'system',
        priority: 'low',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      
      refreshStats();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao parar serviço';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, refreshStats]);

  /**
   * Força o processamento imediato
   */
  const forceProcess = useCallback(async () => {
    try {
      setIsLoading(true);
      await followUpService.forceProcess();
      
      // Adicionar notificação de processamento
      addNotification({
        id: `force_process_${Date.now()}`,
        title: 'Processamento Forçado',
        message: 'Follow-ups foram processados manualmente',
        type: 'system',
        priority: 'low',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      
      // Atualizar contadores (mock)
      setStats(prev => ({
        ...prev,
        lastProcessedAt: new Date().toISOString(),
        totalNotificationsSent: prev.totalNotificationsSent + Math.floor(Math.random() * 5),
        totalLeadsProcessed: prev.totalLeadsProcessed + Math.floor(Math.random() * 10)
      }));
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar follow-ups';
      setError(errorMessage);
      
      addNotification({
        id: `process_error_${Date.now()}`,
        title: 'Erro no Processamento',
        message: errorMessage,
        type: 'system',
        priority: 'high',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  /**
   * Atualiza a configuração do serviço
   */
  const updateConfig = useCallback((config: Partial<FollowUpServiceConfig>) => {
    try {
      // Em uma implementação real, isso atualizaria a configuração do serviço
      console.log('Atualizando configuração do serviço:', config);
      
      if (config.checkInterval) {
        setStats(prev => ({
          ...prev,
          checkInterval: config.checkInterval!
        }));
      }
      
      addNotification({
        id: `config_updated_${Date.now()}`,
        title: 'Configuração Atualizada',
        message: 'As configurações do serviço de follow-up foram atualizadas',
        type: 'system',
        priority: 'low',
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(errorMessage);
    }
  }, [addNotification]);

  /**
   * Simula atualizações periódicas das estatísticas
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.isRunning) {
        // Simular processamento automático
        const shouldUpdate = Math.random() < 0.3; // 30% de chance
        
        if (shouldUpdate) {
          setStats(prev => ({
            ...prev,
            lastProcessedAt: new Date().toISOString(),
            totalNotificationsSent: prev.totalNotificationsSent + Math.floor(Math.random() * 3),
            totalLeadsProcessed: prev.totalLeadsProcessed + Math.floor(Math.random() * 5)
          }));
        }
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [stats.isRunning]);

  /**
   * Inicializar estatísticas na montagem do componente
   */
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  /**
   * Listener para eventos do serviço (simulado)
   */
  useEffect(() => {
    const handleServiceEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'notification_sent':
          setStats(prev => ({
            ...prev,
            totalNotificationsSent: prev.totalNotificationsSent + 1
          }));
          break;
          
        case 'lead_processed':
          setStats(prev => ({
            ...prev,
            totalLeadsProcessed: prev.totalLeadsProcessed + 1
          }));
          break;
          
        case 'error':
          setError(data.message);
          break;
          
        default:
          break;
      }
    };

    // Em uma implementação real, isso seria um listener real
    // window.addEventListener('followup-service-event', handleServiceEvent);
    
    return () => {
      // window.removeEventListener('followup-service-event', handleServiceEvent);
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    startService,
    stopService,
    forceProcess,
    updateConfig,
    refreshStats
  };
}

/**
 * Hook simplificado para verificar se o serviço está ativo
 */
export function useFollowUpServiceStatus(): {
  isRunning: boolean;
  lastProcessedAt: string | null;
} {
  const [status, setStatus] = useState({
    isRunning: false,
    lastProcessedAt: null as string | null
  });

  useEffect(() => {
    const updateStatus = () => {
      const stats = followUpService.getStats();
      setStatus({
        isRunning: stats.isRunning,
        lastProcessedAt: stats.lastProcessedAt
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // A cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return status;
}