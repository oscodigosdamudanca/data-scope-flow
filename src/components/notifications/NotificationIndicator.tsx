import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationCenter } from './NotificationCenter';

export function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Usando try/catch para evitar erros caso o hook não esteja dentro do provider
  let notifications = [];
  let stats = { unread: 0 };
  
  try {
    const notificationsData = useNotifications();
    if (notificationsData) {
      notifications = notificationsData.notifications || [];
      stats = notificationsData.stats || { unread: 0 };
    }
  } catch (error) {
    console.error("Erro ao usar hook de notificações:", error);
  }
  
  const unreadCount = stats?.unread || 0;
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}