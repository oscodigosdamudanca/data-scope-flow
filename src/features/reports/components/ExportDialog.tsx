import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  FileText,
  Image,
  Table,
  Mail,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date;
  to: Date;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
  dateRange: DateRange;
  filters: Record<string, any>;
}

type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png' | 'json';
type ExportType = 'summary' | 'detailed' | 'charts' | 'raw';

interface ExportOption {
  id: string;
  format: ExportFormat;
  type: ExportType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  size?: string;
  features: string[];
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf-summary',
    format: 'pdf',
    type: 'summary',
    title: 'Relatório PDF - Resumo',
    description: 'Relatório executivo com métricas principais e gráficos',
    icon: FileText,
    size: '~2-5 MB',
    features: ['Métricas principais', 'Gráficos', 'Análises', 'Formatação profissional']
  },
  {
    id: 'pdf-detailed',
    format: 'pdf',
    type: 'detailed',
    title: 'Relatório PDF - Detalhado',
    description: 'Relatório completo com todos os dados e análises',
    icon: FileText,
    size: '~5-15 MB',
    features: ['Dados completos', 'Gráficos detalhados', 'Tabelas', 'Insights']
  },
  {
    id: 'excel-data',
    format: 'excel',
    type: 'detailed',
    title: 'Planilha Excel',
    description: 'Dados estruturados em planilha para análise',
    icon: Table,
    size: '~1-3 MB',
    features: ['Múltiplas abas', 'Dados filtrados', 'Fórmulas', 'Gráficos']
  },
  {
    id: 'csv-raw',
    format: 'csv',
    type: 'raw',
    title: 'Arquivo CSV',
    description: 'Dados brutos em formato CSV para importação',
    icon: Table,
    size: '~100-500 KB',
    features: ['Dados brutos', 'Compatível', 'Leve', 'Importável']
  },
  {
    id: 'png-charts',
    format: 'png',
    type: 'charts',
    title: 'Gráficos PNG',
    description: 'Imagens dos gráficos em alta resolução',
    icon: Image,
    size: '~2-8 MB',
    features: ['Alta resolução', 'Múltiplos gráficos', 'Transparência', 'Web-ready']
  },
  {
    id: 'json-api',
    format: 'json',
    type: 'raw',
    title: 'Dados JSON',
    description: 'Dados estruturados em formato JSON para APIs',
    icon: Settings,
    size: '~50-200 KB',
    features: ['Estruturado', 'API-ready', 'Metadados', 'Compacto']
  }
];

const SCHEDULE_OPTIONS = [
  { value: 'once', label: 'Uma vez' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' }
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  data,
  dateRange,
  filters
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['pdf-summary']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('once');
  const [customFileName, setCustomFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getSelectedOptionsDetails = () => {
    return EXPORT_OPTIONS.filter(option => selectedOptions.includes(option.id));
  };

  const estimateFileSize = () => {
    const selected = getSelectedOptionsDetails();
    // Simulação de cálculo de tamanho baseado nas opções selecionadas
    let totalSize = 0;
    selected.forEach(option => {
      const sizeStr = option.size || '1 MB';
      const sizeNum = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
      totalSize += sizeNum;
    });
    return `~${totalSize.toFixed(1)} MB`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('processing');
    setExportProgress(0);

    try {
      // Simulação do processo de exportação
      const steps = [
        'Coletando dados...',
        'Processando filtros...',
        'Gerando gráficos...',
        'Formatando relatório...',
        'Finalizando exportação...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExportProgress(((i + 1) / steps.length) * 100);
      }

      // Aqui seria implementada a lógica real de exportação
      console.log('Exportando com as seguintes configurações:', {
        selectedOptions,
        includeCharts,
        includeRawData,
        emailRecipients,
        scheduleFrequency,
        customFileName,
        notes,
        dateRange,
        filters
      });

      setExportStatus('success');
      
      // Simular download
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus('idle');
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Erro na exportação:', error);
      setExportStatus('error');
      setIsExporting(false);
    }
  };

  const generateFileName = () => {
    if (customFileName) return customFileName;
    
    const dateStr = new Date().toISOString().split('T')[0];
    const formatStr = selectedOptions.length === 1 
      ? EXPORT_OPTIONS.find(opt => opt.id === selectedOptions[0])?.format || 'export'
      : 'multi';
    
    return `relatorio-${dateStr}.${formatStr}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar seu relatório personalizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Período */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>De: {dateRange.from.toLocaleDateString()}</span>
                <span>Até: {dateRange.to.toLocaleDateString()}</span>
                <Badge variant="outline">
                  {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} dias
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Opções de Formato */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Formatos de Exportação</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPORT_OPTIONS.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                const Icon = option.icon;
                
                return (
                  <Card 
                    key={option.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary bg-primary/5'
                    )}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => handleOptionToggle(option.id)}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{option.title}</span>
                            {option.size && (
                              <Badge variant="secondary" className="text-xs">
                                {option.size}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {option.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Opções Avançadas */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Opções Avançadas</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações de Conteúdo */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Conteúdo</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeCharts" 
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Incluir gráficos e visualizações
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeRawData" 
                      checked={includeRawData}
                      onCheckedChange={(checked) => setIncludeRawData(checked === true)}
                    />
                    <Label htmlFor="includeRawData" className="text-sm">
                      Incluir dados brutos em anexo
                    </Label>
                  </div>
                </div>
              </div>

              {/* Configurações de Entrega */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Entrega</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="text-xs text-muted-foreground">
                      Frequência
                    </Label>
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">
                      Enviar por email (opcional)
                    </Label>
                    <Input
                      id="email"
                      placeholder="email1@exemplo.com, email2@exemplo.com"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações Adicionais */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fileName" className="text-sm font-medium">
                  Nome do arquivo (opcional)
                </Label>
                <Input
                  id="fileName"
                  placeholder={generateFileName()}
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tamanho estimado</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="outline">{estimateFileSize()}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedOptions.length} formato(s) selecionado(s)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas adicionais (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Adicione contexto ou observações sobre este relatório..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Progress Bar durante exportação */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {exportStatus === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {exportStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {exportStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                <span className="text-sm font-medium">
                  {exportStatus === 'processing' && 'Processando exportação...'}
                  {exportStatus === 'success' && 'Exportação concluída!'}
                  {exportStatus === 'error' && 'Erro na exportação'}
                </span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedOptions.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar ({selectedOptions.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};