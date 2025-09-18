import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { 
  Notification, 
  NotificationFilters, 
  NotificationStats, 
  CreateNotificationData,
  UpdateNotificationData,
  NotificationSettings,
  UpdateNotificationSettingsData
} from '../types/notifications';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';

export interface NotificationsContextType {
  notifications: Notification[];
  stats: NotificationStats;
  settings: NotificationSettings | null;
  filters: NotificationFilters;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  
  // Notification CRUD operations
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  loadNotifications: (filters?: NotificationFilters) => Promise<void>; // Adicionando a função loadNotifications
  createNotification: (data: CreateNotificationData) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, data: UpdateNotificationData) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  
  // Settings operations
  fetchSettings: () => Promise<void>;
  updateSettings: (data: UpdateNotificationSettingsData) => Promise<void>;
  
  // Stats operations
  fetchStats: () => Promise<void>;
  
  // Filter operations
  setFilters: (filters: NotificationFilters) => void;
  clearFilters: () => void;
  
  // Utility operations
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
}

interface NotificationsState {
  notifications: Notification[];
  stats: NotificationStats;
  settings: NotificationSettings | null;
  filters: NotificationFilters;
  loading: boolean;
  error: string | null;
}

type NotificationsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; data: Partial<Notification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_STATS'; payload: NotificationStats }
  | { type: 'SET_SETTINGS'; payload: NotificationSettings }
  | { type: 'SET_FILTERS'; payload: NotificationFilters }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' };

const initialState: NotificationsState = {
  notifications: [],
  stats: {
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
    byType: {
      lead_created: 0,
      lead_updated: 0,
      lead_status_changed: 0,
      follow_up_reminder: 0,
      follow_up_overdue: 0,
      lead_converted: 0,
      lead_lost: 0,
      system_alert: 0,
      custom: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    }
  },
  settings: null,
  filters: {},
  loading: false,
  error: null
};

function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, loading: false, error: null };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        error: null 
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.data }
            : notification
        ),
        error: null
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        error: null
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.status === 'unread'
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    default:
      return state;
  }
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  // Mock data para desenvolvimento
  const mockNotifications: Notification[] = [
    {
      id: '1',
      company_id: currentCompany?.id || '1',
      user_id: user?.id,
      type: 'follow_up_reminder',
      priority: 'high',
      status: 'unread',
      title: 'Follow-up necessário',
      message: 'Lead João Silva aguarda contato há 3 dias',
      lead_id: '1',
      action_url: '/leads/1',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      company_id: currentCompany?.id || '1',
      type: 'lead_created',
      priority: 'medium',
      status: 'unread',
      title: 'Novo lead capturado',
      message: 'Maria Santos se cadastrou via formulário do site',
      lead_id: '2',
      action_url: '/leads/2',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      company_id: currentCompany?.id || '1',
      user_id: user?.id,
      type: 'lead_converted',
      priority: 'high',
      status: 'read',
      title: 'Lead convertido!',
      message: 'Carlos Oliveira fechou negócio no valor de R$ 5.000',
      lead_id: '3',
      action_url: '/leads/3',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      company_id: currentCompany?.id || '1',
      type: 'follow_up_overdue',
      priority: 'urgent',
      status: 'unread',
      title: 'Follow-up em atraso',
      message: 'Ana Costa deveria ter sido contatada há 5 dias',
      lead_id: '4',
      action_url: '/leads/4',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockSettings: NotificationSettings = {
    id: '1',
    user_id: user?.id || '1',
    company_id: currentCompany?.id || '1',
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    notification_types: {
      lead_created: { enabled: true, email: true, push: true, in_app: true },
      lead_updated: { enabled: true, email: false, push: true, in_app: true },
      lead_status_changed: { enabled: true, email: true, push: true, in_app: true },
      follow_up_reminder: { enabled: true, email: true, push: true, in_app: true },
      follow_up_overdue: { enabled: true, email: true, push: true, in_app: true },
      lead_converted: { enabled: true, email: true, push: true, in_app: true },
      lead_lost: { enabled: true, email: false, push: true, in_app: true },
      system_alert: { enabled: true, email: true, push: true, in_app: true },
      custom: { enabled: true, email: false, push: false, in_app: true }
    },
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '08:00',
      timezone: 'America/Sao_Paulo'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Funções de notificações
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredNotifications = [...mockNotifications];
      
      if (filters) {
        if (filters.status) {
          filteredNotifications = filteredNotifications.filter(n => n.status === filters.status);
        }
        if (filters.type) {
          filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
        }
        if (filters.priority) {
          filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredNotifications = filteredNotifications.filter(n => 
            n.title.toLowerCase().includes(search) || 
            n.message.toLowerCase().includes(search)
          );
        }
      }
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: filteredNotifications });
      
      // Calculando stats diretamente em vez de chamar fetchStats
      const stats: NotificationStats = {
        total: filteredNotifications.length,
        unread: filteredNotifications.filter(n => n.status === 'unread').length,
        read: filteredNotifications.filter(n => n.status === 'read').length,
        archived: filteredNotifications.filter(n => n.status === 'archived').length,
        byType: {
          lead_created: filteredNotifications.filter(n => n.type === 'lead_created').length,
          lead_updated: filteredNotifications.filter(n => n.type === 'lead_updated').length,
          lead_status_changed: filteredNotifications.filter(n => n.type === 'lead_status_changed').length,
          follow_up_reminder: filteredNotifications.filter(n => n.type === 'follow_up_reminder').length,
          follow_up_overdue: filteredNotifications.filter(n => n.type === 'follow_up_overdue').length,
          lead_converted: filteredNotifications.filter(n => n.type === 'lead_converted').length,
          lead_lost: filteredNotifications.filter(n => n.type === 'lead_lost').length,
          system_alert: filteredNotifications.filter(n => n.type === 'system_alert').length,
          custom: filteredNotifications.filter(n => n.type === 'custom').length
        },
        byPriority: {
          low: filteredNotifications.filter(n => n.priority === 'low').length,
          medium: filteredNotifications.filter(n => n.priority === 'medium').length,
          high: filteredNotifications.filter(n => n.priority === 'high').length,
          urgent: filteredNotifications.filter(n => n.priority === 'urgent').length
        }
      };
      
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar notificações' });
    }
  }, []);

  const createNotification = useCallback(async (data: CreateNotificationData): Promise<void> => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...data,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    // Removida chamada redundante de fetchStats
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const updateNotification = useCallback(async (id: string, data: UpdateNotificationData) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, data } });
    // Removida chamada redundante de fetchStats
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    // Removida chamada redundante de fetchStats
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    // Removida chamada redundante de fetchStats
  }, []);

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    // Removida chamada redundante de fetchStats
  }, []);

  const archiveNotification = useCallback(async (id: string) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, data: { status: 'archived' } } });
    // Chamada direta ao dispatch em vez de usar updateNotification para evitar chamadas aninhadas
  }, []);

  // Estatísticas
  const fetchStats = useCallback(async () => {
    const notifications = state.notifications.length > 0 ? state.notifications : mockNotifications;
    
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      read: notifications.filter(n => n.status === 'read').length,
      archived: notifications.filter(n => n.status === 'archived').length,
      byType: {
        lead_created: notifications.filter(n => n.type === 'lead_created').length,
        lead_updated: notifications.filter(n => n.type === 'lead_updated').length,
        lead_status_changed: notifications.filter(n => n.type === 'lead_status_changed').length,
        follow_up_reminder: notifications.filter(n => n.type === 'follow_up_reminder').length,
        follow_up_overdue: notifications.filter(n => n.type === 'follow_up_overdue').length,
        lead_converted: notifications.filter(n => n.type === 'lead_converted').length,
        lead_lost: notifications.filter(n => n.type === 'lead_lost').length,
        system_alert: notifications.filter(n => n.type === 'system_alert').length,
        custom: notifications.filter(n => n.type === 'custom').length
      },
      byPriority: {
        low: notifications.filter(n => n.priority === 'low').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        high: notifications.filter(n => n.priority === 'high').length,
        urgent: notifications.filter(n => n.priority === 'urgent').length
      }
    };
    
    dispatch({ type: 'SET_STATS', payload: stats });
  }, []);

  // Configurações
  const fetchSettings = useCallback(async () => {
    dispatch({ type: 'SET_SETTINGS', payload: mockSettings });
  }, [mockSettings]);

  const updateSettings = useCallback(async (data: UpdateNotificationSettingsData) => {
    if (state.settings) {
      const updatedSettings: NotificationSettings = {
        ...state.settings,
        ...data,
        notification_types: data.notification_types 
          ? { ...state.settings.notification_types, ...data.notification_types }
          : state.settings.notification_types,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    }
  }, [state.settings]);

  // Filtros
  const setFilters = useCallback((filters: NotificationFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Carregar dados iniciais
  useEffect(() => {
    let isMounted = true;
    if (currentCompany && isMounted) {
      // Usando setTimeout para evitar loop de renderização
      const timer = setTimeout(() => {
        fetchNotifications();
        fetchSettings();
      }, 0);
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
  }, [currentCompany]);

  const unreadCount = state.notifications.filter(n => n.status === 'unread').length;

  // Adicionando loadNotifications como um alias para fetchNotifications
  const loadNotifications = fetchNotifications;

  const contextValue: NotificationsContextType = {
    notifications: state.notifications,
    stats: state.stats,
    settings: state.settings,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    unreadCount,
    fetchNotifications,
    loadNotifications,
    createNotification,
    addNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    fetchStats,
    fetchSettings,
    updateSettings,
    setFilters,
    clearFilters,
    clearNotifications,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}