import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Archive, Filter, Search, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Notification, NotificationFilters, NotificationType, NotificationPriority } from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  lead_created: 'Lead Criado',
  lead_updated: 'Lead Atualizado',
  lead_status_changed: 'Status Alterado',
  follow_up_reminder: 'Lembrete Follow-up',
  follow_up_overdue: 'Follow-up Atrasado',
  lead_converted: 'Lead Convertido',
  lead_lost: 'Lead Perdido',
  system_alert: 'Alerta do Sistema',
  custom: 'Personalizada'
};

const priorityColors = {
  low: 'text-gray-500 bg-gray-100',
  medium: 'text-blue-500 bg-blue-100',
  high: 'text-orange-500 bg-orange-100',
  urgent: 'text-red-500 bg-red-100'
};

const typeIcons = {
  lead_created: Info,
  lead_updated: Info,
  lead_status_changed: CheckCircle,
  follow_up_reminder: Clock,
  follow_up_overdue: AlertCircle,
  lead_converted: CheckCircle,
  lead_lost: X,
  system_alert: AlertCircle,
  custom: Bell
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications,
    stats,
    loading,
    error,
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    setFilters,
    clearFilters,
    loadNotifications
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'unread' | 'read' | 'archived' | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const filters: NotificationFilters = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (selectedType) filters.type = selectedType;
    if (selectedPriority) filters.priority = selectedPriority;
    if (selectedStatus) filters.status = selectedStatus;
    
    setFilters(filters);
    loadNotifications(filters);
  }, [searchTerm, selectedType, selectedPriority, selectedStatus]);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      // Navegar para a URL da ação
      window.location.href = notification.action_url;
    }
  };

  const handleArchive = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedPriority('');
    setSelectedStatus('');
    clearFilters();
    loadNotifications();
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const IconComponent = typeIcons[notification.type];
    const isUnread = notification.status === 'unread';
    
    return (
      <div
        className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
          isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${priorityColors[notification.priority]}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium text-gray-900 ${
                isUnread ? 'font-semibold' : ''
              }`}>
                {notification.title}
              </h4>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  priorityColors[notification.priority]
                }`}>
                  {notification.priority.toUpperCase()}
                </span>
                
                <button
                  onClick={(e) => handleArchive(e, notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Arquivar"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {notificationTypeLabels[notification.type]}
              </span>
              
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Filtros"
            >
              <Filter className="h-4 w-4" />
            </button>
            
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Marcar todas como lidas"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="space-y-3">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filtros em linha */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Status</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                  <option value="archived">Arquivadas</option>
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as NotificationType)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tipo</option>
                  {Object.entries(notificationTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Prioridade</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              {/* Limpar filtros */}
              {(searchTerm || selectedType || selectedPriority || selectedStatus) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista de notificações */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer com estatísticas */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total: {stats.total}</span>
            <span>Não lidas: {stats.unread}</span>
            <span>Arquivadas: {stats.archived}</span>
          </div>
        </div>
      </div>
    </div>
  );
}