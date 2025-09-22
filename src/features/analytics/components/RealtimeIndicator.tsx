import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
  eventsCount?: number;
  className?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  lastUpdate,
  eventsCount = 0,
  className = ""
}) => {
  const getStatusColor = () => {
    if (!isConnected) return "destructive";
    if (lastUpdate && Date.now() - lastUpdate.getTime() < 30000) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (!isConnected) return "Desconectado";
    if (lastUpdate) {
      return `Atualizado ${formatDistanceToNow(lastUpdate, { 
        addSuffix: true, 
        locale: ptBR 
      })}`;
    }
    return "Conectado";
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (lastUpdate && Date.now() - lastUpdate.getTime() < 10000) {
      return <Activity className="h-3 w-3 animate-pulse" />;
    }
    return <Wifi className="h-3 w-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs">Tempo Real</span>
            </Badge>
            {eventsCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{eventsCount} eventos</span>
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">Status: {getStatusText()}</p>
            {eventsCount > 0 && (
              <p className="text-muted-foreground">
                {eventsCount} eventos processados
              </p>
            )}
            {!isConnected && (
              <p className="text-destructive text-xs mt-1">
                Reconectando automaticamente...
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};