import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2, Settings2, Palette, Globe } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCompany } from '@/contexts/CompanyContext';

interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  fontFamily: string;
}

interface FormSettings {
  title: string;
  description: string;
  welcomeMessage: string;
  thankYouMessage: string;
  theme: FormTheme;
  behavior: {
    autoSave: boolean;
    showProgressBar: boolean;
    allowBack: boolean;
    requireAllFields: boolean;
    enableNotifications: boolean;
  };
  integration: {
    webhookUrl: string;
    emailNotifications: boolean;
    slackIntegration: boolean;
    exportFormat: 'csv' | 'xlsx' | 'json';
  };
}

const TurboFormConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formSettings, setFormSettings] = useState<FormSettings>({
    title: 'Formulário Turbo',
    description: 'Capture leads de forma rápida e eficiente',
    welcomeMessage: 'Bem-vindo! Preencha os dados abaixo para continuar.',
    thankYouMessage: 'Obrigado! Entraremos em contato em breve.',
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonStyle: 'rounded',
      fontFamily: 'Inter'
    },
    behavior: {
      autoSave: true,
      showProgressBar: true,
      allowBack: false,
      requireAllFields: false,
      enableNotifications: true
    },
    integration: {
      webhookUrl: '',
      emailNotifications: true,
      slackIntegration: false,
      exportFormat: 'xlsx'
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de configurações
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Aqui seria carregado do banco de dados
        console.log('Configurações carregadas para empresa:', currentCompany?.id);
        
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar as configurações do formulário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentCompany?.id, toast]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Salvando configurações:', formSettings);
      
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações do formulário foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    setFormSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Configurar Formulário Turbo" />
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings2 className="h-5 w-5 mr-2" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Título do Formulário</Label>
              <Input
                id="form-title"
                value={formSettings.title}
                onChange={(e) => updateSettings('title', e.target.value)}
                placeholder="Digite o título do formulário"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-description">Descrição</Label>
              <Textarea
                id="form-description"
                value={formSettings.description}
                onChange={(e) => updateSettings('description', e.target.value)}
                placeholder="Descreva o propósito do formulário"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome-message"
                value={formSettings.welcomeMessage}
                onChange={(e) => updateSettings('welcomeMessage', e.target.value)}
                placeholder="Mensagem exibida no início do formulário"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thank-you-message">Mensagem de Agradecimento</Label>
              <Textarea
                id="thank-you-message"
                value={formSettings.thankYouMessage}
                onChange={(e) => updateSettings('thankYouMessage', e.target.value)}
                placeholder="Mensagem exibida após o envio"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Comportamento */}
        <Card>
          <CardHeader>
            <CardTitle>Comportamento do Formulário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Salvamento automático</Label>
                <p className="text-sm text-muted-foreground">Salva o progresso automaticamente</p>
              </div>
              <Switch
                checked={formSettings.behavior.autoSave}
                onCheckedChange={(checked) => updateSettings('behavior.autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar barra de progresso</Label>
                <p className="text-sm text-muted-foreground">Exibe o progresso do preenchimento</p>
              </div>
              <Switch
                checked={formSettings.behavior.showProgressBar}
                onCheckedChange={(checked) => updateSettings('behavior.showProgressBar', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir voltar</Label>
                <p className="text-sm text-muted-foreground">Permite navegar para campos anteriores</p>
              </div>
              <Switch
                checked={formSettings.behavior.allowBack}
                onCheckedChange={(checked) => updateSettings('behavior.allowBack', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Todos os campos obrigatórios</Label>
                <p className="text-sm text-muted-foreground">Torna todos os campos obrigatórios</p>
              </div>
              <Switch
                checked={formSettings.behavior.requireAllFields}
                onCheckedChange={(checked) => updateSettings('behavior.requireAllFields', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações em tempo real</Label>
                <p className="text-sm text-muted-foreground">Notifica sobre novos leads</p>
              </div>
              <Switch
                checked={formSettings.behavior.enableNotifications}
                onCheckedChange={(checked) => updateSettings('behavior.enableNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Personalização Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Principal</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={formSettings.theme.primaryColor}
                    onChange={(e) => updateSettings('theme.primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={formSettings.theme.primaryColor}
                    onChange={(e) => updateSettings('theme.primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bg-color">Cor de Fundo</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="bg-color"
                    value={formSettings.theme.backgroundColor}
                    onChange={(e) => updateSettings('theme.backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={formSettings.theme.backgroundColor}
                    onChange={(e) => updateSettings('theme.backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="button-style">Estilo dos Botões</Label>
              <Select
                value={formSettings.theme.buttonStyle}
                onValueChange={(value) => updateSettings('theme.buttonStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Arredondado</SelectItem>
                  <SelectItem value="square">Quadrado</SelectItem>
                  <SelectItem value="pill">Pílula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-family">Fonte</Label>
              <Select
                value={formSettings.theme.fontFamily}
                onValueChange={(value) => updateSettings('theme.fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview do tema */}
            <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: formSettings.theme.backgroundColor }}>
              <h4 className="text-sm font-medium mb-2">Prévia do Tema</h4>
              <div className="space-y-2">
                <div 
                  className="text-sm"
                  style={{ 
                    color: formSettings.theme.textColor,
                    fontFamily: formSettings.theme.fontFamily 
                  }}
                >
                  {formSettings.title}
                </div>
                <button
                  className="px-4 py-2 text-white text-sm"
                  style={{
                    backgroundColor: formSettings.theme.primaryColor,
                    borderRadius: formSettings.theme.buttonStyle === 'rounded' ? '6px' : 
                                 formSettings.theme.buttonStyle === 'pill' ? '20px' : '0px'
                  }}
                >
                  Botão de Exemplo
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Integração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={formSettings.integration.webhookUrl}
                onChange={(e) => updateSettings('integration.webhookUrl', e.target.value)}
                placeholder="https://sua-api.com/webhook"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                URL para receber notificações de novos leads
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por e-mail</Label>
                <p className="text-sm text-muted-foreground">Enviar e-mail para novos leads</p>
              </div>
              <Switch
                checked={formSettings.integration.emailNotifications}
                onCheckedChange={(checked) => updateSettings('integration.emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integração com Slack</Label>
                <p className="text-sm text-muted-foreground">Notificar no Slack sobre novos leads</p>
              </div>
              <Switch
                checked={formSettings.integration.slackIntegration}
                onCheckedChange={(checked) => updateSettings('integration.slackIntegration', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Formato de Exportação</Label>
              <Select
                value={formSettings.integration.exportFormat}
                onValueChange={(value) => updateSettings('integration.exportFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formSettings.behavior.autoSave ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Auto Save</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formSettings.behavior.showProgressBar ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Progress Bar</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formSettings.integration.emailNotifications ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Email Alerts</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formSettings.behavior.enableNotifications ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Real-time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormConfigPage;