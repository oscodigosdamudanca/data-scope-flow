import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsData } from './useAnalytics';

export interface RealtimeConfig {
  enabled: boolean;
  refreshInterval: number; // em segundos
  tables: string[]; // tabelas para monitorar
  autoNotify: boolean; // notificar sobre mudanças importantes
}

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
  timestamp: string;
}

export interface RealtimeAnalyticsHook {
  isConnected: boolean;
  lastUpdate: Date | null;
  events: RealtimeEvent[];
  config: RealtimeConfig;
  updateConfig: (newConfig: Partial<RealtimeConfig>) => void;
  clearEvents: () => void;
  reconnect: () => void;
  disconnect: () => void;
}

const DEFAULT_CONFIG: RealtimeConfig = {
  enabled: true,
  refreshInterval: 30,
  tables: ['leads', 'surveys', 'survey_responses', 'companies'],
  autoNotify: true,
};

export const useRealtimeAnalytics = (
  companyId?: string,
  onDataUpdate?: (data: Partial<AnalyticsData>) => void
): RealtimeAnalyticsHook => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [config, setConfig] = useState<RealtimeConfig>(DEFAULT_CONFIG);
  
  const channelRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para processar eventos em tempo real
  const processRealtimeEvent = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table: payload.table,
      record: payload.new || payload.old,
      old_record: payload.old,
      timestamp: new Date().toISOString(),
    };

    setEvents(prev => [event, ...prev.slice(0, 99)]); // Manter apenas os últimos 100 eventos
    setLastUpdate(new Date());

    // Notificar sobre leads de alto potencial
    if (config.autoNotify && payload.table === 'leads' && payload.eventType === 'INSERT') {
      const lead = payload.new;
      if (lead?.priority === 'high' || lead?.score > 80) {
        toast({
          title: "🎯 Lead de Alto Potencial!",
          description: `Novo lead qualificado: ${lead.name || 'Lead sem nome'}`,
          duration: 5000,
        });
      }
    }

    // Chamar callback de atualização de dados se fornecido
    if (onDataUpdate) {
      // Simular dados atualizados baseados no evento
      const updatedData: Partial<AnalyticsData> = {};
      
      if (payload.table === 'leads') {
        updatedData.leadsCount = (updatedData.leadsCount || 0) + (payload.eventType === 'INSERT' ? 1 : 0);
        updatedData.leadsToday = (updatedData.leadsToday || 0) + (payload.eventType === 'INSERT' ? 1 : 0);
      }
      
      if (payload.table === 'surveys' || payload.table === 'survey_responses') {
        updatedData.surveysResponses = (updatedData.surveysResponses || 0) + (payload.eventType === 'INSERT' ? 1 : 0);
      }

      onDataUpdate(updatedData);
    }
  }, [config.autoNotify, onDataUpdate, toast]);

  // Conectar ao Supabase Realtime
  const connect = useCallback(() => {
    if (!user || !config.enabled || channelRef.current) return;

    try {
      const channel = supabase.channel(`analytics-${companyId || 'global'}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id },
        },
      });

      // Inscrever-se nas mudanças das tabelas relevantes
      config.tables.forEach(table => {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: companyId ? `company_id=eq.${companyId}` : undefined,
          },
          processRealtimeEvent
        );
      });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Conectado ao Supabase Realtime para Analytics');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('❌ Erro na conexão Realtime');
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Erro ao conectar Realtime:', error);
      setIsConnected(false);
    }
  }, [user, config.enabled, config.tables, companyId, processRealtimeEvent]);

  // Desconectar do Supabase Realtime
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
      console.log('🔌 Desconectado do Supabase Realtime');
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reconectar
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Atualizar configuração
  const updateConfig = useCallback((newConfig: Partial<RealtimeConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      
      // Se mudou as tabelas ou habilitou/desabilitou, reconectar
      if (
        newConfig.tables !== undefined || 
        newConfig.enabled !== undefined
      ) {
        setTimeout(() => {
          disconnect();
          if (updated.enabled) {
            connect();
          }
        }, 100);
      }
      
      return updated;
    });
  }, [disconnect, connect]);

  // Limpar eventos
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Configurar intervalo de refresh automático
  useEffect(() => {
    if (config.enabled && config.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
      }, config.refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config.enabled, config.refreshInterval]);

  // Conectar/desconectar baseado na configuração
  useEffect(() => {
    if (config.enabled && user) {
      connect();
    } else {
      disconnect();
    }

    return disconnect;
  }, [config.enabled, user, connect, disconnect]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastUpdate,
    events,
    config,
    updateConfig,
    clearEvents,
    reconnect,
    disconnect,
  };
};