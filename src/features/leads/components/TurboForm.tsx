import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateTurboFormData, RateLimiter, logSecurely } from '@/utils/validation';

interface TurboFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  lgpd_consent: boolean;
}

const TurboForm: React.FC = () => {
  const [formData, setFormData] = useState<TurboFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    lgpd_consent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rateLimiter] = useState(() => new RateLimiter('turbo_form', 3, 300000)); // 3 tentativas por 5 minutos

  const validateForm = (): { isValid: boolean; sanitizedData?: any } => {
    try {
      const result = validateTurboFormData(formData);
      setErrors(result.errors);
      return {
        isValid: result.isValid,
        sanitizedData: result.data
      };
    } catch (error: any) {
      logSecurely('Validation error in TurboForm', { error: error.message });
      setErrors({ general: 'Dados inválidos detectados. Verifique as informações.' });
      return { isValid: false };
    }
  };

  const handleInputChange = (field: keyof TurboFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpar erro geral também
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar rate limiting
    if (!rateLimiter.canProceed()) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime() / 1000 / 60);
      toast({
        title: 'Muitas tentativas',
        description: `Aguarde ${remainingTime} minutos antes de tentar novamente.`,
        variant: 'destructive'
      });
      return;
    }
    
    const validation = validateForm();
    if (!validation.isValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: validation.sanitizedData.name,
          email: validation.sanitizedData.email,
          phone: validation.sanitizedData.phone,
          company_name: validation.sanitizedData.company,
          source_type: 'turbo_form',
          lgpd_consent: validation.sanitizedData.lgpd_consent,
          created_by: 'turbo_form'
        });
      
      if (error) {
        throw error;
      }
      
      setIsSubmitted(true);
      logSecurely('TurboForm submission successful', { email: validation.sanitizedData.email });
      
      toast({
        title: 'Sucesso!',
        description: 'Seus dados foram enviados com sucesso. Entraremos em contato em breve.',
      });
      
    } catch (error: any) {
      logSecurely('TurboForm submission error', { error: error.message });
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar seus dados. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado!</h2>
              <p className="text-gray-600">
                Seus dados foram enviados com sucesso. Nossa equipe entrará em contato em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Captação Rápida
          </CardTitle>
          <CardDescription>
            Preencha seus dados e nossa equipe entrará em contato
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nome da sua empresa"
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="lgpd-consent"
                  checked={formData.lgpd_consent}
                  onCheckedChange={(checked) => handleInputChange('lgpd_consent', checked as boolean)}
                  className={errors.lgpd_consent ? 'border-red-500' : ''}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="lgpd-consent"
                    className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Aceito os{' '}
                    <Link 
                      to="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      termos de privacidade
                    </Link>{' '}
                    e autorizo o uso dos meus dados conforme a LGPD *
                  </Label>
                </div>
              </div>
              {errors.lgpd_consent && (
                <p className="text-sm text-red-500">{errors.lgpd_consent}</p>
              )}
            </div>
            
            {errors.general && (
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs text-gray-600">
                <strong>Segurança:</strong> Seus dados são protegidos por validação robusta e criptografia. 
                Utilizamos rate limiting para prevenir spam e detectamos automaticamente conteúdo suspeito.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertDescription className="text-xs text-gray-600">
                Seus dados serão utilizados apenas para contato comercial e não serão compartilhados com terceiros.
              </AlertDescription>
            </Alert>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Dados'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboForm;