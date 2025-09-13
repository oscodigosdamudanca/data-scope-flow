import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, User, Mail, Phone, Building, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PublicLeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  interests: string[];
  notes?: string;
  lgpdConsent: boolean;
  marketingConsent: boolean;
}

const INTEREST_OPTIONS = [
  'Tecnologia',
  'Marketing Digital',
  'Vendas',
  'Recursos Humanos',
  'Finanças',
  'Operações',
  'Inovação',
  'Sustentabilidade',
  'Educação',
  'Consultoria',
  'Outros'
];

const PublicLeadCapturePage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<PublicLeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: [],
    notes: '',
    lgpdConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Telefone inválido (formato: +55 11 99999-9999)';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Cargo é obrigatório';
    }

    // Validação LGPD
    if (!formData.lgpdConsent) {
      newErrors.lgpdConsent = 'É necessário aceitar os termos de privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implementar integração real com Supabase
      console.log('Submitting public lead:', {
        ...formData,
        source: 'public_form',
        created_at: new Date().toISOString()
      });

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitted(true);
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Obrigado pelo seu interesse. Entraremos em contato em breve.',
      });

    } catch (error) {
      console.error('Error submitting public lead:', error);
      toast({
        title: 'Erro ao enviar formulário',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Obrigado!</h2>
                <p className="text-gray-600 mt-2">
                  Seu cadastro foi realizado com sucesso. Nossa equipe entrará em contato em breve.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    position: '',
                    interests: [],
                    notes: '',
                    lgpdConsent: false,
                    marketingConsent: false,
                  });
                }}
                variant="outline"
                className="w-full"
              >
                Cadastrar outro lead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Cadastro de Lead
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Preencha seus dados para receber mais informações sobre nossos produtos e serviços.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos obrigatórios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="+55 11 99999-9999"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Empresa *
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className={errors.company ? 'border-red-500' : ''}
                    placeholder="Nome da sua empresa"
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  Cargo *
                </Label>
                <Input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className={errors.position ? 'border-red-500' : ''}
                  placeholder="Seu cargo na empresa"
                />
                {errors.position && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Interesses */}
              <div className="space-y-3">
                <Label>Áreas de Interesse (opcional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais que gostaria de compartilhar..."
                  rows={3}
                />
              </div>

              {/* Consentimentos LGPD */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Proteção de Dados</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Seus dados serão tratados de acordo com nossa Política de Privacidade.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="lgpdConsent"
                      checked={formData.lgpdConsent}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, lgpdConsent: checked as boolean }))
                      }
                      className={errors.lgpdConsent ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="lgpdConsent" className="text-sm cursor-pointer">
                      Aceito o tratamento dos meus dados pessoais conforme a{' '}
                      <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                        Política de Privacidade
                      </a>{' '}
                      e autorizo o contato para fins comerciais. *
                    </Label>
                  </div>
                  {errors.lgpdConsent && (
                    <p className="text-sm text-red-600 flex items-center gap-1 ml-6">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lgpdConsent}
                    </p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
                      }
                    />
                    <Label htmlFor="marketingConsent" className="text-sm cursor-pointer">
                      Desejo receber comunicações de marketing, promoções e novidades por email.
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Enviar Cadastro
                  </div>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                * Campos obrigatórios
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicLeadCapturePage;