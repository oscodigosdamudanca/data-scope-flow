import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Save, Plus, Trash2, Edit, Eye, Copy } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCompany } from '@/contexts/CompanyContext';

interface FormQuestion {
  id: string;
  question: string;
  type: 'text' | 'email' | 'tel' | 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  order: number;
}

interface FormConfiguration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  questions: FormQuestion[];
  settings: {
    showProgressBar: boolean;
    requireLGPD: boolean;
    customSuccessMessage: string;
    allowMultipleSubmissions: boolean;
  };
}

const TurboFormAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  
  const [formConfig, setFormConfig] = useState<FormConfiguration>({
    id: 'turbo-form-1',
    name: 'Formulário Turbo',
    description: 'Formulário de captura rápida de leads',
    isActive: true,
    questions: [
      {
        id: 'q1',
        question: 'Qual é o seu nome completo?',
        type: 'text',
        required: true,
        order: 1
      },
      {
        id: 'q2',
        question: 'Qual é o seu e-mail profissional?',
        type: 'email',
        required: true,
        order: 2
      },
      {
        id: 'q3',
        question: 'Qual é o seu telefone de contato?',
        type: 'tel',
        required: false,
        order: 3
      }
    ],
    settings: {
      showProgressBar: true,
      requireLGPD: true,
      customSuccessMessage: 'Obrigado! Entraremos em contato em breve.',
      allowMultipleSubmissions: false
    }
  });

  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de dados
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Gerar URL de compartilhamento
        const baseUrl = window.location.origin;
        const publicUrl = `${baseUrl}/leads/turbo/public/${currentCompany?.id || 'demo'}`;
        setShareUrl(publicUrl);
        
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar a configuração do formulário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFormConfig();
  }, [currentCompany?.id, toast]);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configuração salva!',
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

  const handleAddQuestion = () => {
    const newQuestion: FormQuestion = {
      id: `q${Date.now()}`,
      question: 'Nova pergunta',
      type: 'text',
      required: false,
      order: formConfig.questions.length + 1
    };
    
    setFormConfig(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleRemoveQuestion = (questionId: string) => {
    setFormConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    setFormConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copiado!',
        description: 'O link de compartilhamento foi copiado para a área de transferência.',
      });
    }
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
        <PageTitle title="Administrar Formulário Turbo" />
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleSaveConfig} disabled={saving}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="sharing">Compartilhamento</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-name">Nome do Formulário</Label>
                  <Input
                    id="form-name"
                    value={formConfig.name}
                    onChange={(e) => setFormConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="form-status"
                      checked={formConfig.isActive}
                      onCheckedChange={(checked) => setFormConfig(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Badge variant={formConfig.isActive ? "default" : "secondary"}>
                      {formConfig.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-description">Descrição</Label>
                <Textarea
                  id="form-description"
                  value={formConfig.description}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Configurações Avançadas</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar barra de progresso</Label>
                    <p className="text-sm text-muted-foreground">Exibe o progresso do preenchimento</p>
                  </div>
                  <Switch
                    checked={formConfig.settings.showProgressBar}
                    onCheckedChange={(checked) => setFormConfig(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showProgressBar: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir consentimento LGPD</Label>
                    <p className="text-sm text-muted-foreground">Obrigatório para conformidade legal</p>
                  </div>
                  <Switch
                    checked={formConfig.settings.requireLGPD}
                    onCheckedChange={(checked) => setFormConfig(prev => ({
                      ...prev,
                      settings: { ...prev.settings, requireLGPD: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir múltiplas submissões</Label>
                    <p className="text-sm text-muted-foreground">Permite que o mesmo usuário envie várias vezes</p>
                  </div>
                  <Switch
                    checked={formConfig.settings.allowMultipleSubmissions}
                    onCheckedChange={(checked) => setFormConfig(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowMultipleSubmissions: checked }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="success-message">Mensagem de Sucesso</Label>
                  <Textarea
                    id="success-message"
                    value={formConfig.settings.customSuccessMessage}
                    onChange={(e) => setFormConfig(prev => ({
                      ...prev,
                      settings: { ...prev.settings, customSuccessMessage: e.target.value }
                    }))}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gerenciar Perguntas</CardTitle>
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formConfig.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Pergunta {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pergunta</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={question.type}
                        onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value as FormQuestion['type'] })}
                      >
                        <option value="text">Texto</option>
                        <option value="email">E-mail</option>
                        <option value="tel">Telefone</option>
                        <option value="textarea">Texto longo</option>
                        <option value="radio">Múltipla escolha</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => handleUpdateQuestion(question.id, { required: checked })}
                    />
                    <Label>Campo obrigatório</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compartilhamento do Formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link Público do Formulário</Label>
                <div className="flex items-center space-x-2">
                  <div className="bg-muted p-3 rounded flex-1 text-sm font-mono">
                    {shareUrl}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use este link para compartilhar o formulário com sua equipe ou incorporá-lo em outros sistemas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <h4 className="font-medium">QR Code</h4>
                      <div className="w-32 h-32 bg-muted rounded-lg mx-auto flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">QR Code será gerado aqui</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Baixar QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Estatísticas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Visualizações:</span>
                          <span className="text-sm font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Submissões:</span>
                          <span className="text-sm font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Taxa de conversão:</span>
                          <span className="text-sm font-medium">0%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Visualização do Formulário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-lg p-8">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{formConfig.name}</h3>
                    <p className="text-muted-foreground">{formConfig.description}</p>
                  </div>
                  
                  {formConfig.settings.showProgressBar && (
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {formConfig.questions.slice(0, 3).map((question, index) => (
                      <div key={question.id} className="space-y-1">
                        <Label className="text-sm">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input placeholder="Resposta do usuário..." disabled />
                      </div>
                    ))}
                    
                    {formConfig.settings.requireLGPD && (
                      <div className="flex items-start space-x-2 pt-2">
                        <input type="checkbox" disabled className="mt-1" />
                        <Label className="text-xs text-muted-foreground">
                          Aceito os termos de privacidade e autorizo o uso dos meus dados
                        </Label>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full" disabled>
                    Enviar Formulário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TurboFormAdminPage;