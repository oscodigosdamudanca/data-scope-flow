import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Calendar,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: number;
  icon: React.ComponentType<any>;
  description?: string;
  color: string;
}

interface ConversionMetricsProps {
  data: {
    conversionRate: number;
    avgTimeToConvert: number; // em dias
    leadQuality: number; // score de 0-100
    monthlyGrowth: number;
    targetConversionRate: number;
    totalLeads: number;
    convertedLeads: number;
    avgDealValue: number;
    costPerLead: number;
  };
  period: string;
  className?: string;
}

const ConversionMetrics: React.FC<ConversionMetricsProps> = ({
  data,
  period,
  className = ''
}) => {
  const {
    conversionRate,
    avgTimeToConvert,
    leadQuality,
    monthlyGrowth,
    targetConversionRate,
    totalLeads,
    convertedLeads,
    avgDealValue,
    costPerLead
  } = data;

  // Calcular ROI
  const roi = costPerLead > 0 ? ((avgDealValue - costPerLead) / costPerLead) * 100 : 0;

  const metrics: MetricCard[] = [
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionRate - targetConversionRate,
      changeType: conversionRate >= targetConversionRate ? 'increase' : 'decrease',
      target: targetConversionRate,
      icon: Target,
      description: `Meta: ${targetConversionRate}%`,
      color: 'text-blue-600'
    },
    {
      title: 'Tempo Médio de Conversão',
      value: `${avgTimeToConvert.toFixed(0)} dias`,
      change: monthlyGrowth,
      changeType: avgTimeToConvert <= 30 ? 'increase' : 'decrease',
      icon: Clock,
      description: 'Ciclo de vendas',
      color: 'text-green-600'
    },
    {
      title: 'Qualidade dos Leads',
      value: `${leadQuality.toFixed(0)}/100`,
      change: monthlyGrowth * 0.8,
      changeType: leadQuality >= 70 ? 'increase' : leadQuality >= 50 ? 'neutral' : 'decrease',
      icon: Award,
      description: 'Score de qualificação',
      color: 'text-purple-600'
    },
    {
      title: 'Crescimento Mensal',
      value: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
      change: monthlyGrowth,
      changeType: monthlyGrowth > 0 ? 'increase' : monthlyGrowth < 0 ? 'decrease' : 'neutral',
      icon: TrendingUp,
      description: 'Comparado ao mês anterior',
      color: 'text-orange-600'
    },
    {
      title: 'ROI por Lead',
      value: `${roi > 0 ? '+' : ''}${roi.toFixed(0)}%`,
      change: roi,
      changeType: roi > 100 ? 'increase' : roi > 0 ? 'neutral' : 'decrease',
      icon: TrendingUp,
      description: `Custo: R$ ${costPerLead.toFixed(0)}`,
      color: 'text-emerald-600'
    },
    {
      title: 'Volume de Leads',
      value: totalLeads.toLocaleString(),
      change: monthlyGrowth,
      changeType: totalLeads > 100 ? 'increase' : totalLeads > 50 ? 'neutral' : 'decrease',
      icon: Users,
      description: `${convertedLeads} convertidos`,
      color: 'text-indigo-600'
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calcular performance geral
  const overallPerformance = (
    (conversionRate / targetConversionRate) * 0.4 +
    (leadQuality / 100) * 0.3 +
    (roi > 0 ? Math.min(roi / 200, 1) : 0) * 0.3
  ) * 100;

  return (
    <div className={className}>
      {/* Header com Performance Geral */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Métricas de Conversão - {period}</span>
            <Badge 
              variant={overallPerformance >= 80 ? 'default' : overallPerformance >= 60 ? 'secondary' : 'destructive'}
              className="text-sm"
            >
              Performance: {overallPerformance.toFixed(0)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance Geral</span>
              <span className="font-medium">{overallPerformance.toFixed(1)}%</span>
            </div>
            <Progress value={overallPerformance} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {overallPerformance >= 80 ? (
                <>
                  <Award className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Excelente performance</span>
                </>
              ) : overallPerformance >= 60 ? (
                <>
                  <Target className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-600">Performance satisfatória</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Performance precisa melhorar</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  
                  {metric.description && (
                    <div className="text-xs text-muted-foreground">
                      {metric.description}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={`text-xs font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      vs período anterior
                    </span>
                  </div>

                  {/* Barra de progresso para métricas com target */}
                  {metric.target && (
                    <div className="mt-3">
                      <Progress 
                        value={Math.min((parseFloat(metric.value.toString()) / metric.target) * 100, 100)} 
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights e Recomendações */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversionRate < targetConversionRate && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-red-800">Taxa de conversão abaixo da meta</div>
                  <div className="text-red-700">
                    Considere revisar o processo de qualificação e follow-up dos leads.
                  </div>
                </div>
              </div>
            )}
            
            {avgTimeToConvert > 45 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">Ciclo de vendas longo</div>
                  <div className="text-yellow-700">
                    Tempo médio de {avgTimeToConvert.toFixed(0)} dias. Considere automatizar mais etapas do processo.
                  </div>
                </div>
              </div>
            )}
            
            {leadQuality < 60 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Award className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-orange-800">Qualidade dos leads baixa</div>
                  <div className="text-orange-700">
                    Score de {leadQuality.toFixed(0)}/100. Revise os critérios de captura e qualificação.
                  </div>
                </div>
              </div>
            )}
            
            {roi > 200 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Excelente ROI</div>
                  <div className="text-green-700">
                    ROI de {roi.toFixed(0)}% indica ótima eficiência. Considere aumentar o investimento.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionMetrics;