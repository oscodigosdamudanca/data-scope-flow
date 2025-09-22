import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Star, 
  TrendingUp, 
  User, 
  Clock, 
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface HighValueLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  score: number;
  interests: string[];
  source: string;
  timestamp: Date;
  isRead: boolean;
}

interface RealtimeNotificationsProps {
  companyId: string;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  companyId,
  isVisible,
  onToggle,
  className = ""
}) => {
  const [notifications, setNotifications] = useState<HighValueLead[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [minScore, setMinScore] = useState(80);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simular notificações de leads de alto potencial
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular chegada de novo lead de alto potencial (20% de chance)
      if (Math.random() < 0.2) {
        const newLead: HighValueLead = {
          id: `lead-${Date.now()}`,
          name: `Lead ${Math.floor(Math.random() * 1000)}`,
          email: `lead${Math.floor(Math.random() * 1000)}@empresa.com`,
          phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
          company: `Empresa ${Math.floor(Math.random() * 100)}`,
          score: Math.floor(Math.random() * 20) + 80, // Score entre 80-100
          interests: ['Produto Premium', 'Consultoria Especializada'],
          source: ['Website', 'LinkedIn', 'Indicação'][Math.floor(Math.random() * 3)],
          timestamp: new Date(),
          isRead: false
        };

        setNotifications(prev => [newLead, ...prev.slice(0, 19)]); // Manter apenas 20 notificações
        setUnreadCount(prev => prev + 1);

        // Tocar som se habilitado
        if (soundEnabled) {
          // Criar um som simples usando Web Audio API
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }

        // Mostrar toast notification
        toast.success(`🌟 Novo lead de alto potencial!`, {
          description: `${newLead.name} - Score: ${newLead.score}`,
          action: {
            label: "Ver detalhes",
            onClick: () => onToggle()
          }
        });
      }
    }, 15000); // Verificar a cada 15 segundos

    return () => clearInterval(interval);
  }, [soundEnabled, onToggle]);

  const markAsRead = (leadId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === leadId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (leadId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== leadId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 85) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 85) return "secondary";
    return "outline";
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={`relative ${className}`}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`w-96 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5" />
            Leads de Alto Potencial
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-full"
          >
            Marcar todas como lidas
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação ainda</p>
              <p className="text-sm">
                Você será notificado quando leads de alto potencial (score ≥ {minScore}) forem captados
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((lead, index) => (
                <div key={lead.id}>
                  <div 
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !lead.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(lead.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{lead.name}</span>
                          <Badge 
                            variant={getScoreBadgeVariant(lead.score)}
                            className={`flex items-center gap-1 ${getScoreColor(lead.score)}`}
                          >
                            <Star className="h-3 w-3" />
                            {lead.score}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="truncate">{lead.email}</p>
                          {lead.company && (
                            <p className="truncate">{lead.company}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {formatDistanceToNow(lead.timestamp, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {lead.source}
                            </Badge>
                          </div>
                        </div>
                        
                        {lead.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.interests.slice(0, 2).map((interest, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {lead.interests.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{lead.interests.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(lead.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};