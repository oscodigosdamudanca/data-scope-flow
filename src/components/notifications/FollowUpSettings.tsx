import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Play,
  Pause,
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  Bell,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFollowUpRules } from '../../hooks/useFollowUpRules';
import { useFollowUpService } from '../../hooks/useFollowUpService';
import { FollowUpRule, NotificationPriority, NotificationType } from '../../types/notifications';
import { toast } from '@/hooks/use-toast';

interface FollowUpSettingsProps {
  className?: string;
}

export function FollowUpSettings({ className = '' }: FollowUpSettingsProps) {
  const {
    rules,
    isLoading: rulesLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule
  } = useFollowUpRules();
  
  const {
    stats,
    isLoading: serviceLoading,
    error: serviceError,
    startService,
    stopService,
    forceProcess,
    updateConfig
  } = useFollowUpService();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FollowUpRule | null>(null);
  const [newCheckInterval, setNewCheckInterval] = useState(stats.checkInterval);

  // Form state para nova regra
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    status: ['new'],
    daysSinceLastContact: 1,
    source: [] as string[],
    tags: [] as string[],
    notificationType: 'follow_up' as NotificationType,
    priority: 'medium' as NotificationPriority,
    message: '',
    frequency: 'once',
    time: '09:00'
  });

  const handleCreateRule = async () => {
    if (!newRule.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da regra é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    const rule: Omit<FollowUpRule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: newRule.name,
      description: newRule.description,
      isActive: true,
      conditions: {
        status: newRule.status,
        daysSinceLastContact: newRule.daysSinceLastContact,
        source: newRule.source.length > 0 ? newRule.source : undefined,
        tags: newRule.tags.length > 0 ? newRule.tags : undefined
      },
      actions: {
        createNotification: true,
        notificationType: newRule.notificationType,
        priority: newRule.priority,
        message: newRule.message || `Follow-up necessário para {{leadName}}`
      },
      schedule: {
        frequency: newRule.frequency,
        time: newRule.time
      }
    };

    await createRule(rule);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewRule({
      name: '',
      description: '',
      status: ['new'],
      daysSinceLastContact: 1,
      source: [],
      tags: [],
      notificationType: 'follow_up',
      priority: 'medium',
      message: '',
      frequency: 'once',
      time: '09:00'
    });
  };

  const handleUpdateConfig = () => {
    updateConfig({ checkInterval: newCheckInterval });
    toast({
      title: 'Configuração Atualizada',
      description: `Intervalo de verificação alterado para ${newCheckInterval} minutos`
    });
  };

  const formatLastProcessed = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return `${Math.floor(diffMinutes / 1440)} dias atrás`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Follow-up</h2>
          <p className="text-muted-foreground">
            Gerencie regras automáticas de follow-up para leads
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={stats.isRunning ? 'default' : 'secondary'}>
            {stats.isRunning ? (
              <><Activity className="h-3 w-3 mr-1" /> Ativo</>
            ) : (
              <><Pause className="h-3 w-3 mr-1" /> Parado</>
            )}
          </Badge>
          
          {stats.isRunning ? (
            <Button variant="outline" size="sm" onClick={stopService} disabled={serviceLoading}>
              <Pause className="h-4 w-4 mr-2" />
              Parar
            </Button>
          ) : (
            <Button size="sm" onClick={startService} disabled={serviceLoading}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          )}
        </div>
      </div>

      {serviceError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Erro no serviço:</span>
              <span className="text-sm">{serviceError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Serviço</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.isRunning ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Última verificação: {formatLastProcessed(stats.lastProcessedAt)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notificações Enviadas</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNotificationsSent}</div>
                <p className="text-xs text-muted-foreground">
                  Total de notificações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Processados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeadsProcessed}</div>
                <p className="text-xs text-muted-foreground">
                  Total de leads analisados
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Processar Follow-ups Agora</h4>
                  <p className="text-sm text-muted-foreground">
                    Força o processamento imediato de todos os follow-ups pendentes
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={forceProcess}
                  disabled={serviceLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Processar
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Intervalo de Verificação</h4>
                  <p className="text-sm text-muted-foreground">
                    Atualmente: a cada {stats.checkInterval} minutos
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    value={newCheckInterval}
                    onChange={(e) => setNewCheckInterval(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUpdateConfig}
                    disabled={newCheckInterval === stats.checkInterval}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Regras de Follow-up</h3>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Regra de Follow-up</DialogTitle>
                  <DialogDescription>
                    Configure uma nova regra automática para follow-up de leads
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Nome da Regra</Label>
                      <Input
                        id="rule-name"
                        value={newRule.name}
                        onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Follow-up Leads Novos"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rule-priority">Prioridade</Label>
                      <Select
                        value={newRule.priority}
                        onValueChange={(value: NotificationPriority) => 
                          setNewRule(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Descrição</Label>
                    <Input
                      id="rule-description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva quando esta regra deve ser aplicada"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-days">Dias desde último contato</Label>
                      <Input
                        id="rule-days"
                        type="number"
                        min="1"
                        value={newRule.daysSinceLastContact}
                        onChange={(e) => setNewRule(prev => ({ 
                          ...prev, 
                          daysSinceLastContact: Number(e.target.value) 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rule-time">Horário de envio</Label>
                      <Input
                        id="rule-time"
                        type="time"
                        value={newRule.time}
                        onChange={(e) => setNewRule(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rule-message">Mensagem personalizada</Label>
                    <Input
                      id="rule-message"
                      value={newRule.message}
                      onChange={(e) => setNewRule(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Use {{leadName}} para incluir o nome do lead"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateRule}>
                    Criar Regra
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {rulesLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Carregando regras...</span>
                  </div>
                </CardContent>
              </Card>
            ) : rules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma regra configurada</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie sua primeira regra de follow-up automático
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Regra
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                        <div>
                          <CardTitle className="text-base">{rule.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                        
                        <Badge variant="outline">
                          {rule.actions.priority?.toUpperCase()}
                        </Badge>
                        
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Regra</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a regra "{rule.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRule(rule.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <div className="text-muted-foreground">
                          {rule.conditions.status?.join(', ') || 'Todos'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Dias:</span>
                        <div className="text-muted-foreground">
                          {rule.conditions.daysSinceLastContact || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Horário:</span>
                        <div className="text-muted-foreground">
                          {rule.schedule.time}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <div className="text-muted-foreground">
                          {rule.actions.notificationType}
                        </div>
                      </div>
                    </div>
                    
                    {rule.actions.message && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Mensagem:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rule.actions.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure o comportamento geral do sistema de follow-up
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-iniciar serviço</Label>
                  <p className="text-sm text-muted-foreground">
                    Iniciar automaticamente o serviço quando a aplicação carregar
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificações de follow-up também por email
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Logs detalhados</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar informações detalhadas sobre o processamento
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}