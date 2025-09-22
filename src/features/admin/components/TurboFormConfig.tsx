import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Target, 
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface InterestArea {
  id: string;
  value: string;
  label: string;
  description?: string;
  color: string;
  isActive: boolean;
  order: number;
}

interface BudgetRange {
  id: string;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface UrgencyLevel {
  id: string;
  value: string;
  label: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
}

interface TurboFormConfigData {
  interestAreas: InterestArea[];
  budgetRanges: BudgetRange[];
  urgencyLevels: UrgencyLevel[];
  isCustomized: boolean;
}

const DEFAULT_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-yellow-100 text-yellow-800',
  'bg-red-100 text-red-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-gray-100 text-gray-800'
];

const DEFAULT_URGENCY_COLORS = [
  'text-red-600',
  'text-orange-600',
  'text-yellow-600',
  'text-green-600',
  'text-blue-600'
];

const TurboFormConfig: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TurboFormConfigData>({
    interestAreas: [
      { id: '1', value: 'tecnologia', label: 'Tecnologia e Inovação', color: 'bg-blue-100 text-blue-800', isActive: true, order: 1 },
      { id: '2', value: 'marketing', label: 'Marketing Digital', color: 'bg-green-100 text-green-800', isActive: true, order: 2 },
      { id: '3', value: 'vendas', label: 'Vendas e CRM', color: 'bg-purple-100 text-purple-800', isActive: true, order: 3 },
      { id: '4', value: 'rh', label: 'Recursos Humanos', color: 'bg-orange-100 text-orange-800', isActive: true, order: 4 },
      { id: '5', value: 'financas', label: 'Finanças e Controladoria', color: 'bg-yellow-100 text-yellow-800', isActive: true, order: 5 },
      { id: '6', value: 'operacoes', label: 'Operações e Logística', color: 'bg-red-100 text-red-800', isActive: true, order: 6 },
      { id: '7', value: 'consultoria', label: 'Consultoria Empresarial', color: 'bg-indigo-100 text-indigo-800', isActive: true, order: 7 }
    ],
    budgetRanges: [
      { id: '1', value: 'ate-10k', label: 'Até R$ 10.000', description: 'Projetos pequenos', isActive: true, order: 1 },
      { id: '2', value: '10k-50k', label: 'R$ 10.000 a R$ 50.000', description: 'Projetos médios', isActive: true, order: 2 },
      { id: '3', value: '50k-100k', label: 'R$ 50.000 a R$ 100.000', description: 'Projetos grandes', isActive: true, order: 3 },
      { id: '4', value: 'acima-100k', label: 'Acima de R$ 100.000', description: 'Projetos enterprise', isActive: true, order: 4 },
      { id: '5', value: 'nao-definido', label: 'Ainda não definido', description: 'Em fase de planejamento', isActive: true, order: 5 }
    ],
    urgencyLevels: [
      { id: '1', value: 'imediato', label: 'Imediato', description: 'Preciso começar agora', color: 'text-red-600', isActive: true, order: 1 },
      { id: '2', value: '30-dias', label: 'Até 30 dias', description: 'Próximo mês', color: 'text-orange-600', isActive: true, order: 2 },
      { id: '3', value: '90-dias', label: 'Até 90 dias', description: 'Próximo trimestre', color: 'text-yellow-600', isActive: true, order: 3 },
      { id: '4', value: '6-meses', label: 'Até 6 meses', description: 'Planejamento futuro', color: 'text-green-600', isActive: true, order: 4 },
      { id: '5', value: 'sem-pressa', label: 'Sem pressa', description: 'Apenas explorando', color: 'text-blue-600', isActive: true, order: 5 }
    ],
    isCustomized: false
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'interest' | 'budget' | 'urgency' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Aqui você salvaria a configuração no banco de dados
      // Por enquanto, vamos simular o salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfig(prev => ({ ...prev, isCustomized: true }));
      
      toast({
        title: "Configuração salva",
        description: "As configurações do Formulário Turbo foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setConfig(prev => ({ ...prev, isCustomized: false }));
    toast({
      title: "Configuração restaurada",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  const handleAddItem = (type: 'interest' | 'budget' | 'urgency') => {
    setEditingType(type);
    setEditingItem({
      id: Date.now().toString(),
      value: '',
      label: '',
      description: '',
      color: type === 'interest' ? DEFAULT_COLORS[0] : type === 'urgency' ? DEFAULT_URGENCY_COLORS[0] : '',
      isActive: true,
      order: getNextOrder(type)
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: any, type: 'interest' | 'budget' | 'urgency') => {
    setEditingType(type);
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string, type: 'interest' | 'budget' | 'urgency') => {
    setConfig(prev => ({
      ...prev,
      [type === 'interest' ? 'interestAreas' : type === 'budget' ? 'budgetRanges' : 'urgencyLevels']: 
        prev[type === 'interest' ? 'interestAreas' : type === 'budget' ? 'budgetRanges' : 'urgencyLevels']
          .filter(item => item.id !== id)
    }));
  };

  const handleToggleActive = (id: string, type: 'interest' | 'budget' | 'urgency') => {
    setConfig(prev => ({
      ...prev,
      [type === 'interest' ? 'interestAreas' : type === 'budget' ? 'budgetRanges' : 'urgencyLevels']: 
        prev[type === 'interest' ? 'interestAreas' : type === 'budget' ? 'budgetRanges' : 'urgencyLevels']
          .map(item => item.id === id ? { ...item, isActive: !item.isActive } : item)
    }));
  };

  const getNextOrder = (type: 'interest' | 'budget' | 'urgency') => {
    const items = config[type === 'interest' ? 'interestAreas' : type === 'budget' ? 'budgetRanges' : 'urgencyLevels'];
    return Math.max(...items.map(item => item.order), 0) + 1;
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingType) return;

    setConfig(prev => {
      const key = editingType === 'interest' ? 'interestAreas' : 
                  editingType === 'budget' ? 'budgetRanges' : 'urgencyLevels';
      
      const existingIndex = prev[key].findIndex(item => item.id === editingItem.id);
      
      if (existingIndex >= 0) {
        // Editar item existente
        return {
          ...prev,
          [key]: prev[key].map(item => 
            item.id === editingItem.id ? editingItem : item
          )
        };
      } else {
        // Adicionar novo item
        return {
          ...prev,
          [key]: [...prev[key], editingItem]
        };
      }
    });

    setIsDialogOpen(false);
    setEditingItem(null);
    setEditingType(null);
  };

  const renderItemsList = (items: any[], type: 'interest' | 'budget' | 'urgency', title: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        <Button
          onClick={() => handleAddItem(type)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  item.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => handleToggleActive(item.id, type)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.label}</span>
                      {type === 'interest' && (
                        <Badge className={item.color} variant="secondary">
                          {item.value}
                        </Badge>
                      )}
                      {type === 'urgency' && (
                        <span className={`text-sm font-medium ${item.color}`}>
                          {item.value}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item, type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id, type)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuração do Formulário Turbo</h1>
          <p className="text-gray-600">
            Personalize as áreas de interesse e opções de qualificação do formulário
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>

      {config.isCustomized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Configuração Personalizada Ativa
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            O formulário está usando configurações personalizadas. As alterações serão aplicadas imediatamente.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {renderItemsList(config.interestAreas, 'interest', 'Áreas de Interesse')}
        {renderItemsList(config.budgetRanges, 'budget', 'Faixas de Orçamento')}
        {renderItemsList(config.urgencyLevels, 'urgency', 'Níveis de Urgência')}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id && config[editingType === 'interest' ? 'interestAreas' : editingType === 'budget' ? 'budgetRanges' : 'urgencyLevels']?.find(item => item.id === editingItem.id) ? 'Editar' : 'Adicionar'} {
                editingType === 'interest' ? 'Área de Interesse' :
                editingType === 'budget' ? 'Faixa de Orçamento' : 'Nível de Urgência'
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="value">Valor (ID)</Label>
                <Input
                  id="value"
                  value={editingItem.value}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="ex: tecnologia"
                />
              </div>
              
              <div>
                <Label htmlFor="label">Rótulo</Label>
                <Input
                  id="label"
                  value={editingItem.label}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="ex: Tecnologia e Inovação"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional"
                  rows={2}
                />
              </div>
              
              {(editingType === 'interest' || editingType === 'urgency') && (
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Select
                    value={editingItem.color}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(editingType === 'interest' ? DEFAULT_COLORS : DEFAULT_URGENCY_COLORS).map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.includes('bg-') ? color : `bg-gray-200 ${color}`}`}></div>
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TurboFormConfig;