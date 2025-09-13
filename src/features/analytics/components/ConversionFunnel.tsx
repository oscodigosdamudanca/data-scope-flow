import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Target, CheckCircle, XCircle } from 'lucide-react';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  conversionRate?: number;
  color: string;
  icon: React.ComponentType<any>;
}

interface ConversionFunnelProps {
  totalVisitors: number;
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  className?: string;
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  totalVisitors,
  totalLeads,
  qualifiedLeads,
  convertedLeads,
  className = ''
}) => {
  // Calcular as etapas do funil
  const stages: FunnelStage[] = [
    {
      name: 'Visitantes',
      count: totalVisitors,
      percentage: 100,
      color: 'bg-blue-500',
      icon: Users
    },
    {
      name: 'Leads Capturados',
      count: totalLeads,
      percentage: totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0,
      conversionRate: totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0,
      color: 'bg-green-500',
      icon: Target
    },
    {
      name: 'Leads Qualificados',
      count: qualifiedLeads,
      percentage: totalVisitors > 0 ? (qualifiedLeads / totalVisitors) * 100 : 0,
      conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      color: 'bg-yellow-500',
      icon: CheckCircle
    },
    {
      name: 'Leads Convertidos',
      count: convertedLeads,
      percentage: totalVisitors > 0 ? (convertedLeads / totalVisitors) * 100 : 0,
      conversionRate: qualifiedLeads > 0 ? (convertedLeads / qualifiedLeads) * 100 : 0,
      color: 'bg-purple-500',
      icon: CheckCircle
    }
  ];

  // Calcular taxa de conversão geral
  const overallConversionRate = totalVisitors > 0 ? (convertedLeads / totalVisitors) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Funil de Conversão
        </CardTitle>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Taxa Geral: {overallConversionRate.toFixed(1)}%
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {overallConversionRate > 5 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={overallConversionRate > 5 ? 'text-green-600' : 'text-red-600'}>
              {overallConversionRate > 5 ? 'Boa conversão' : 'Baixa conversão'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === stages.length - 1;
            const nextStage = stages[index + 1];
            const dropOffRate = nextStage ? stage.percentage - nextStage.percentage : 0;
            
            return (
              <div key={stage.name} className="relative">
                {/* Etapa do Funil */}
                <div className="flex items-center gap-4">
                  {/* Ícone e Nome */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className={`p-2 rounded-lg ${stage.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                      <Icon className={`h-4 w-4 ${stage.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{stage.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {stage.count.toLocaleString()} pessoas
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {stage.percentage.toFixed(1)}% do total
                      </span>
                      {stage.conversionRate && (
                        <Badge variant="secondary" className="text-xs">
                          {stage.conversionRate.toFixed(1)}% conversão
                        </Badge>
                      )}
                    </div>
                    <Progress 
                      value={stage.percentage} 
                      className="h-3"
                    />
                  </div>

                  {/* Métricas */}
                  <div className="text-right min-w-[100px]">
                    <div className="text-lg font-bold">
                      {stage.count.toLocaleString()}
                    </div>
                    {stage.conversionRate && (
                      <div className="text-xs text-muted-foreground">
                        {stage.conversionRate.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Drop-off entre etapas */}
                {!isLast && dropOffRate > 0 && (
                  <div className="ml-[200px] mt-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <XCircle className="h-3 w-3" />
                      <span>
                        {dropOffRate.toFixed(1)}% abandonaram ({(stage.count - (nextStage?.count || 0)).toLocaleString()} pessoas)
                      </span>
                    </div>
                  </div>
                )}

                {/* Linha conectora */}
                {!isLast && (
                  <div className="ml-[32px] mt-3 mb-3">
                    <div className="w-px h-4 bg-border"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo de Insights */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Insights do Funil</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Melhor etapa:</span>
                <span className="font-medium">
                  {stages.reduce((best, stage) => 
                    (stage.conversionRate || 0) > (best.conversionRate || 0) ? stage : best
                  ).name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maior gargalo:</span>
                <span className="font-medium text-red-600">
                  {stages.reduce((worst, stage, index) => {
                    const nextStage = stages[index + 1];
                    const dropOff = nextStage ? stage.percentage - nextStage.percentage : 0;
                    const worstDropOff = worst.dropOff || 0;
                    return dropOff > worstDropOff ? { ...stage, dropOff } : worst;
                  }, { name: 'N/A', dropOff: 0 }).name}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total convertido:</span>
                <span className="font-medium text-green-600">
                  {convertedLeads.toLocaleString()} leads
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potencial perdido:</span>
                <span className="font-medium text-orange-600">
                  {(totalLeads - convertedLeads).toLocaleString()} leads
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;