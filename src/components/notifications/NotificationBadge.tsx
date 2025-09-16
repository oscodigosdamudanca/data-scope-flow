import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationBadge({ className = '', showLabel = false }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center space-x-2 p-2 rounded-lg transition-colors hover:bg-gray-100 ${className}`}
        title="Notificações"
      >
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            Notificações
            {unreadCount > 0 && (
              <span className="ml-1 text-red-500">({unreadCount})</span>
            )}
          </span>
        )}
      </button>
      
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}