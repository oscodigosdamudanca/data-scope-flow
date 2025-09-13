import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  description?: string;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    border: 'border-orange-200'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-500',
    border: 'border-red-200'
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    icon: 'text-gray-500',
    border: 'border-gray-200'
  }
};

const sizeVariants = {
  sm: {
    card: 'p-4',
    icon: 'h-8 w-8',
    title: 'text-sm',
    value: 'text-2xl',
    description: 'text-xs'
  },
  md: {
    card: 'p-6',
    icon: 'h-10 w-10',
    title: 'text-base',
    value: 'text-3xl',
    description: 'text-sm'
  },
  lg: {
    card: 'p-8',
    icon: 'h-12 w-12',
    title: 'text-lg',
    value: 'text-4xl',
    description: 'text-base'
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  description,
  loading = false,
  trend,
  prefix = '',
  suffix = '',
  size = 'md'
}) => {
  const colorClasses = colorVariants[color];
  const sizeClasses = sizeVariants[size];

  // Determinar tendência baseada no change se trend não for fornecido
  const getTrend = () => {
    if (trend) return trend;
    if (change === undefined || change === null) return 'neutral';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const currentTrend = getTrend();

  const getTrendIcon = () => {
    switch (currentTrend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (currentTrend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className={sizeClasses.card}>
          <div className="flex items-center justify-between mb-4">
            <div className={cn('rounded-lg', colorClasses.bg, 'p-2')}>
              <div className={cn(sizeClasses.icon, 'bg-gray-300 rounded')}></div>
            </div>
            {change !== undefined && (
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className={cn('bg-gray-300 rounded w-1/2', 
              size === 'sm' ? 'h-6' : size === 'md' ? 'h-8' : 'h-10'
            )}></div>
            {description && (
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className={sizeClasses.card}>
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'rounded-lg p-2 border',
            colorClasses.bg,
            colorClasses.border
          )}>
            <Icon className={cn(sizeClasses.icon, colorClasses.icon)} />
          </div>
          
          {change !== undefined && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs font-medium',
                getTrendColor()
              )}
            >
              <TrendIcon className="h-3 w-3 mr-1" />
              {Math.abs(change).toFixed(1)}%
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className={cn(
            'font-medium text-muted-foreground',
            sizeClasses.title
          )}>
            {title}
          </p>
          
          <p className={cn(
            'font-bold tracking-tight',
            colorClasses.text,
            sizeClasses.value
          )}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          
          {description && (
            <p className={cn(
              'text-muted-foreground',
              sizeClasses.description
            )}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para múltiplas métricas em grid
interface MetricsGridProps {
  metrics: Omit<MetricCardProps, 'size'>[];
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 4,
  size = 'md',
  loading = false
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns])}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          {...metric}
          size={size}
          loading={loading}
        />
      ))}
    </div>
  );
};