import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Palette,
  Layout,
  Bell,
  Download,
  Filter,
  X
} from 'lucide-react';
import { DateRange } from '../hooks/useAnalytics';
import { BIConfig, WidgetConfig } from '../hooks/useBIConfig';

interface DashboardSettingsProps {
  companyId: string;
  dashboardType: string;
  biConfig?: BIConfig;
  onClose: () => void;
  onAutoRefreshChange: (enabled: boolean) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  companyId,
  dashboardType,
  biConfig,
  onClose,
  onAutoRefreshChange,
  onDateRangeChange
}) => {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    showNotifications: true,
    theme: 'light',
    dateRange: 'last30days',
    customDateStart: '',
    customDateEnd: '',
    visibleWidgets: [] as string[],
    widgetLayout: 'grid',
    exportFormat: 'pdf'
  });

  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (biConfig) {
      setSettings(prev => ({
        ...prev,
        visibleWidgets: biConfig.widget_configs?.map(w => w.id) || [],
        widgetLayout: biConfig.layout_config?.theme || 'grid'
      }));
    }
  }, [biConfig]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);

    // Aplicar mudanças imediatamente para algumas configurações
    if (key === 'autoRefresh') {
      onAutoRefreshChange(value);
    }

    if (key === 'dateRange' || key === 'customDateStart' || key === 'customDateEnd') {
      updateDateRange({ ...settings, [key]: value });
    }
  };

  const updateDateRange = (newSettings: typeof settings) => {
    let dateRange: DateRange | undefined;

    switch (newSettings.dateRange) {
      case 'today':
        dateRange = {
          from: new Date(),
          to: new Date()
        };
        break;
      case 'last7days':
        dateRange = {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: new Date()
        };
        break;
      case 'last30days':
        dateRange = {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        };
        break;
      case 'last90days':
        dateRange = {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          to: new Date()
        };
        break;
      case 'custom':
        if (newSettings.customDateStart && newSettings.customDateEnd) {
          dateRange = {
            from: new Date(newSettings.customDateStart),
            to: new Date(newSettings.customDateEnd)
          };
        }
        break;
      default:
        dateRange = undefined;
    }

    onDateRangeChange(dateRange);
  };

  const handleSave = () => {
    // Implementar salvamento das configurações
    console.log('Salvando configurações:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      autoRefresh: true,
      refreshInterval: 30,
      showNotifications: true,
      theme: 'light',
      dateRange: 'last30days',
      customDateStart: '',
      customDateEnd: '',
      visibleWidgets: [],
      widgetLayout: 'grid',
      exportFormat: 'pdf'
    });
    setHasChanges(true);
  };

  const availableWidgets = [
    { id: 'leads-overview', name: 'Visão Geral de Leads', category: 'leads' },
    { id: 'leads-status', name: 'Status dos Leads', category: 'leads' },
    { id: 'leads-source', name: 'Origem dos Leads', category: 'leads' },
    { id: 'surveys-completion', name: 'Taxa de Conclusão', category: 'surveys' },
    { id: 'surveys-ratings', name: 'Avaliações', category: 'surveys' },
    { id: 'surveys-responses', name: 'Respostas por Tipo', category: 'surveys' },
    { id: 'overview-metrics', name: 'Métricas Gerais', category: 'overview' },
    { id: 'overview-trends', name: 'Tendências', category: 'overview' }
  ];

  const filteredWidgets = availableWidgets.filter(widget => 
    dashboardType === 'overview' || widget.category === dashboardType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configurações do Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Personalize a visualização e comportamento do seu dashboard
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atualização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizar dados automaticamente
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                />
              </div>

              {/* Refresh Interval */}
              {settings.autoRefresh && (
                <div className="space-y-2">
                  <Label>Intervalo de Atualização (segundos)</Label>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) => handleSettingChange('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 segundos</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">1 minuto</SelectItem>
                      <SelectItem value="300">5 minutos</SelectItem>
                      <SelectItem value="600">10 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações de novos dados
                  </p>
                </div>
                <Switch
                  checked={settings.showNotifications}
                  onCheckedChange={(checked) => handleSettingChange('showNotifications', checked)}
                />
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Widgets Visíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Layout */}
              <div className="space-y-2">
                <Label>Layout dos Widgets</Label>
                <Select
                  value={settings.widgetLayout}
                  onValueChange={(value) => handleSettingChange('widgetLayout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grade</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                    <SelectItem value="masonry">Mosaico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Widget Selection */}
              <div className="space-y-3">
                <Label>Selecionar Widgets</Label>
                <div className="grid grid-cols-1 gap-2">
                  {filteredWidgets.map((widget) => {
                    const isVisible = settings.visibleWidgets.includes(widget.id);
                    return (
                      <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {isVisible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{widget.name}</div>
                            <Badge variant="secondary" className="text-xs">
                              {widget.category}
                            </Badge>
                          </div>
                        </div>
                        <Switch
                          checked={isVisible}
                          onCheckedChange={(checked) => {
                            const newWidgets = checked
                              ? [...settings.visibleWidgets, widget.id]
                              : settings.visibleWidgets.filter(id => id !== widget.id);
                            handleSettingChange('visibleWidgets', newWidgets);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtros de Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Período de Dados</Label>
                <Select
                  value={settings.dateRange}
                  onValueChange={(value) => handleSettingChange('dateRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="last90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {settings.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={settings.customDateStart}
                      onChange={(e) => handleSettingChange('customDateStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={settings.customDateEnd}
                      onChange={(e) => handleSettingChange('customDateEnd', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Format */}
              <div className="space-y-2">
                <Label>Formato de Exportação</Label>
                <Select
                  value={settings.exportFormat}
                  onValueChange={(value) => handleSettingChange('exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <Label>Opções de Exportação</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="include-charts" />
                    <Label htmlFor="include-charts">Incluir gráficos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-raw-data" />
                    <Label htmlFor="include-raw-data">Incluir dados brutos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-summary" defaultChecked />
                    <Label htmlFor="include-summary">Incluir resumo</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restaurar Padrões
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="min-w-[100px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Bell className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Você tem alterações não salvas
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardSettings;