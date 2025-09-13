import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  Save,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date;
  to: Date;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ReportFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset?: () => void;
  onSave?: (name: string) => void;
  className?: string;
}

const PRESET_RANGES = [
  {
    label: 'Últimos 7 dias',
    value: 'last7days',
    getDates: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Últimos 30 dias',
    value: 'last30days',
    getDates: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Últimos 90 dias',
    value: 'last90days',
    getDates: () => ({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Este mês',
    value: 'thisMonth',
    getDates: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date()
      };
    }
  },
  {
    label: 'Mês passado',
    value: 'lastMonth',
    getDates: () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: lastMonth,
        to: lastDayOfLastMonth
      };
    }
  }
];

const FILTER_OPTIONS = {
  source: [
    { value: 'all', label: 'Todas as fontes', count: 245 },
    { value: 'website', label: 'Website', count: 120 },
    { value: 'social', label: 'Redes Sociais', count: 85 },
    { value: 'email', label: 'Email Marketing', count: 40 },
    { value: 'referral', label: 'Indicação', count: 25 },
    { value: 'organic', label: 'Busca Orgânica', count: 35 }
  ],
  status: [
    { value: 'all', label: 'Todos os status', count: 245 },
    { value: 'new', label: 'Novo', count: 89 },
    { value: 'contacted', label: 'Contatado', count: 67 },
    { value: 'qualified', label: 'Qualificado', count: 45 },
    { value: 'converted', label: 'Convertido', count: 23 },
    { value: 'lost', label: 'Perdido', count: 21 }
  ],
  category: [
    { value: 'all', label: 'Todas as categorias', count: 245 },
    { value: 'product-a', label: 'Produto A', count: 98 },
    { value: 'product-b', label: 'Produto B', count: 76 },
    { value: 'service-a', label: 'Serviço A', count: 45 },
    { value: 'service-b', label: 'Serviço B', count: 26 }
  ],
  priority: [
    { value: 'all', label: 'Todas as prioridades', count: 245 },
    { value: 'high', label: 'Alta', count: 34 },
    { value: 'medium', label: 'Média', count: 156 },
    { value: 'low', label: 'Baixa', count: 55 }
  ]
};

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  filters,
  onFilterChange,
  onReset,
  onSave,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedFilterName, setSavedFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handlePresetRange = (preset: typeof PRESET_RANGES[0]) => {
    onDateRangeChange(preset.getDates());
  };

  const handleReset = () => {
    onDateRangeChange({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    });
    
    Object.keys(filters).forEach(key => {
      onFilterChange(key, 'all');
    });
    
    setSearchTerm('');
    onReset?.();
  };

  const handleSaveFilters = () => {
    if (savedFilterName.trim()) {
      onSave?.(savedFilterName.trim());
      setSavedFilterName('');
      setShowSaveDialog(false);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all' && value !== '').length;
  };

  const renderFilterSelect = (key: string, options: FilterOption[], label: string) => {
    const filteredOptions = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Select value={filters[key]} onValueChange={(value) => onFilterChange(key, value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Selecionar ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {option.count}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {getActiveFiltersCount() > 0 && (
              <Badge variant="default" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(!showSaveDialog)}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Período de Datas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Período
          </Label>
          
          {/* Presets de Data */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(preset)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* Seletor de Data Customizado */}
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? dateRange.from.toLocaleDateString() : 'Data inicial'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && onDateRangeChange({ ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? dateRange.to.toLocaleDateString() : 'Data final'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => date && onDateRangeChange({ ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Filtros Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderFilterSelect('source', FILTER_OPTIONS.source, 'Fonte')}
          {renderFilterSelect('status', FILTER_OPTIONS.status, 'Status')}
          {renderFilterSelect('category', FILTER_OPTIONS.category, 'Categoria')}
        </div>

        {/* Filtros Avançados (Collapsible) */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            
            {/* Busca por Termo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Label>
              <Input
                placeholder="Buscar por nome, email, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Filtros Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFilterSelect('priority', FILTER_OPTIONS.priority, 'Prioridade')}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opções Avançadas</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeConverted" 
                      checked={filters.includeConverted || false}
                      onCheckedChange={(checked) => onFilterChange('includeConverted', checked)}
                    />
                    <Label htmlFor="includeConverted" className="text-sm">
                      Incluir convertidos
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="onlyActive" 
                      checked={filters.onlyActive || false}
                      onCheckedChange={(checked) => onFilterChange('onlyActive', checked)}
                    />
                    <Label htmlFor="onlyActive" className="text-sm">
                      Apenas ativos
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hasEmail" 
                      checked={filters.hasEmail || false}
                      onCheckedChange={(checked) => onFilterChange('hasEmail', checked)}
                    />
                    <Label htmlFor="hasEmail" className="text-sm">
                      Com email válido
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Dialog para Salvar Filtros */}
        {showSaveDialog && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Nome do Filtro Salvo</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Leads Qualificados Q4"
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSaveFilters} disabled={!savedFilterName.trim()}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSaveDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};