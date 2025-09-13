import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, QrCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface QRCodeConfig {
  id: string;
  name: string;
  description?: string;
  campaign?: string;
  isActive: boolean;
  customFields?: string[];
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  interests: string;
  message: string;
  lgpdConsent: boolean;
  marketingConsent: boolean;
}

const PublicQRLeadCapturePage: React.FC = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [qrConfig, setQrConfig] = useState<QRCodeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: '',
    message: '',
    lgpdConsent: false,
    marketingConsent: false
  });
  
  const [formErrors, setFormErrors] = useState<Partial<LeadFormData>>({});

  // Carregar configuração do QR Code
  useEffect(() => {
    const fetchQRConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - substituir por chamada real da API
        const mockConfigs: Record<string, QRCodeConfig> = {
          'qr1': {
            id: 'qr1',
            name: 'Stand Principal - Feira Tech 2024',
            description: 'Deixe seus dados e receba informações exclusivas sobre nossas soluções',
            campaign: 'Feira Tech 2024',
            isActive: true,
            customFields: ['interests', 'company']
          },
          'qr2': {
            id: 'qr2',
            name: 'Mesa de Demonstração',
            description: 'Interessado em uma demonstração? Deixe seus dados!',
            campaign: 'Demonstrações',
            isActive: true,
            customFields: ['position', 'message']
          },
          'qr3': {
            id: 'qr3',
            name: 'Área de Networking',
            description: 'Vamos nos conectar! Deixe seus dados para networking',
            campaign: 'Networking',
            isActive: false,
            customFields: ['company', 'position']
          }
        };
        
        const config = mockConfigs[qrId || ''];
        
        if (!config) {
          setError('QR Code não encontrado ou inválido.');
          return;
        }
        
        if (!config.isActive) {
          setError('Este QR Code não está mais ativo.');
          return;
        }
        
        setQrConfig(config);
      } catch (err) {
        setError('Erro ao carregar informações do QR Code.');
      } finally {
        setLoading(false);
      }
    };

    if (qrId) {
      fetchQRConfig();
    } else {
      setError('QR Code inválido.');
      setLoading(false);
    }
  }, [qrId]);

  const validateForm = (): boolean => {
    const errors: Partial<LeadFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.lgpdConsent) {
      errors.lgpdConsent = 'Você deve aceitar os termos de privacidade' as any;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro no formulário',
        description: 'Por favor, corrija os campos destacados.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Preparar dados do lead
      const leadData = {
        ...formData,
        source: 'qr_code',
        source_details: {
          qr_code_id: qrId,
          qr_code_name: qrConfig?.name,
          campaign: qrConfig?.campaign
        },
        tags: qrConfig?.campaign ? [qrConfig.campaign] : [],
        created_at: new Date().toISOString()
      };
      
      console.log('Lead data to be saved:', leadData);
      
      // Aqui seria feita a chamada real para a API
      // await createLead(leadData);
      
      setSubmitted(true);
      
      toast({
        title: 'Dados enviados com sucesso!',
        description: 'Obrigado pelo seu interesse. Entraremos em contato em breve.',
      });
      
    } catch (error) {
      toast({
        title: 'Erro ao enviar dados',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando formulário...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-center mb-4">Obrigado!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            {qrConfig?.campaign && (
              <Badge variant="outline" className="mb-4">
                {qrConfig.campaign}
              </Badge>
            )}
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Captação de Leads</h1>
          </div>
          {qrConfig?.campaign && (
            <Badge variant="default" className="mb-4">
              {qrConfig.campaign}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{qrConfig?.name}</CardTitle>
            {qrConfig?.description && (
              <CardDescription className="text-base">
                {qrConfig.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={formErrors.phone ? 'border-red-500' : ''}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Dados Profissionais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Profissionais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="Seu cargo atual"
                    />
                  </div>
                </div>
              </div>

              {/* Interesses */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="interests">Área de Interesse</Label>
                  <Select onValueChange={(value) => handleInputChange('interests', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua área de interesse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="gestao">Gestão</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Conte-nos mais sobre seu interesse ou deixe uma mensagem"
                    rows={4}
                  />
                </div>
              </div>

              {/* Consentimentos LGPD */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Consentimentos
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="lgpdConsent"
                      checked={formData.lgpdConsent}
                      onCheckedChange={(checked) => handleInputChange('lgpdConsent', checked as boolean)}
                      className={formErrors.lgpdConsent ? 'border-red-500' : ''}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="lgpdConsent"
                        className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Aceito o tratamento dos meus dados pessoais conforme a{' '}
                        <a href="#" className="text-primary underline">Política de Privacidade</a> *
                      </Label>
                      {formErrors.lgpdConsent && (
                        <p className="text-sm text-red-500">{formErrors.lgpdConsent as string}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                    />
                    <Label
                      htmlFor="marketingConsent"
                      className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aceito receber comunicações de marketing por e-mail e telefone (opcional)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Dados'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Seus dados estão seguros:</strong> Utilizamos as melhores práticas de segurança 
              e cumprimos integralmente a Lei Geral de Proteção de Dados (LGPD).
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default PublicQRLeadCapturePage;