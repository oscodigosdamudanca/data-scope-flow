import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { Download, Maximize2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartContainerProps {
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut' | 'column' | 'funnel';
  data: any[];
  loading?: boolean;
  height?: number;
  showExport?: boolean;
  showFullscreen?: boolean;
  colors?: string[];
  dataKey?: string;
  nameKey?: string;
  valueKey?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280'  // gray
];

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  type,
  data,
  loading = false,
  height = 300,
  showExport = true,
  showFullscreen = true,
  colors = DEFAULT_COLORS,
  dataKey = 'value',
  nameKey = 'name',
  valueKey = 'value'
}) => {
  const handleExport = () => {
    // Implementar exportação do gráfico
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Lógica de exportação será implementada
    console.log('Exportando gráfico:', title);
  };

  const handleFullscreen = () => {
    // Implementar visualização em tela cheia
    console.log('Expandindo gráfico:', title);
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={type === 'doughnut' ? 80 : 100}
                innerRadius={type === 'doughnut' ? 40 : 0}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey={dataKey}
                data={data}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Tipo de gráfico não suportado: {type}</p>
          </div>
        );
    }
  };

  // Calcular tendência se possível
  const calculateTrend = () => {
    if (!data || data.length < 2) return null;
    
    const values = data.map(item => item[dataKey] || 0);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === 0) return null;
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  const trend = calculateTrend();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {trend && (
              <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="text-xs">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend.value}%
              </Badge>
            )}
            
            {showExport && (
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {showFullscreen && (
              <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};