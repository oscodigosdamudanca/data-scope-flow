import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  Database, 
  Mail, 
  Shield, 
  Bell, 
  Palette,
  Globe,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Configurações Gerais
    siteName: 'DataScope Flow',
    siteDescription: 'Hub de inteligência de mercado para eventos corporativos',
    maintenanceMode: false,
    
    // Configurações de Email
    emailEnabled: true,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    
    // Configurações de Segurança
    twoFactorEnabled: false,
    sessionTimeout: '24',
    passwordMinLength: '8',
    
    // Configurações de Notificações
    emailNotifications: true,
    pushNotifications: false,
    
    // Configurações de API
    apiRateLimit: '1000',
    apiTimeout: '30'
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToDashboard variant="outline" position="header" />
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar para bloquear acesso ao sistema
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir envio de emails
                  </p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => handleInputChange('emailEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Host SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                    disabled={!settings.emailEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                    placeholder="587"
                    disabled={!settings.emailEnabled}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuário SMTP</Label>
                <Input
                  id="smtpUser"
                  value={settings.smtpUser}
                  onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                  placeholder="seu-email@gmail.com"
                  disabled={!settings.emailEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Senha SMTP</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={!settings.emailEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir 2FA para administradores
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Em breve</Badge>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleInputChange('twoFactorEnabled', checked)}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
                <Input
                  id="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  type="number"
                  min="1"
                  max="168"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Tamanho Mínimo da Senha</Label>
                <Input
                  id="passwordMinLength"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                  type="number"
                  min="6"
                  max="32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configurações de API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">Limite de Taxa (req/hora)</Label>
                <Input
                  id="apiRateLimit"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleInputChange('apiRateLimit', e.target.value)}
                  type="number"
                  min="100"
                  max="10000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiTimeout">Timeout da API (segundos)</Label>
                <Input
                  id="apiTimeout"
                  value={settings.apiTimeout}
                  onChange={(e) => handleInputChange('apiTimeout', e.target.value)}
                  type="number"
                  min="5"
                  max="300"
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Chaves de API</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Gerencie as chaves de API para integrações externas.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Key className="h-4 w-4 mr-2" />
                  Gerenciar Chaves (Em breve)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Ações Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Backup do Sistema</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Criar backup completo dos dados.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Database className="h-4 w-4 mr-2" />
                  Criar Backup (Em breve)
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Limpar Cache</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Limpar cache do sistema.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Globe className="h-4 w-4 mr-2" />
                  Limpar Cache (Em breve)
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Logs do Sistema</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Visualizar logs detalhados.
                </p>
                <Button variant="outline" size="sm" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Ver Logs (Em breve)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminSettings;