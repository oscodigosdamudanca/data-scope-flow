import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Send, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Heart,
  FileText,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '../hooks/useLeads';
import { validateTurboFormData } from '@/utils/validation';
import type { CreateLeadData } from '@/types/leads';

interface LeadCaptureFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  interests: string[];
  source_type: 'manual' | 'turbo_form' | 'qr_code' | 'survey' | 'website' | 'social_media' | 'referral' | 'event' | 'cold_outreach' | 'other';
  notes: string;
  lgpd_consent: boolean;
}

interface LeadCaptureFormProps {
  companyId?: string;
  source?: 'manual' | 'qr_code' | 'survey';
  sourceType?: 'manual' | 'turbo_form' | 'qr_code' | 'survey' | 'website' | 'social_media' | 'referral' | 'event' | 'cold_outreach' | 'other';
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
  className?: string;
  title?: string;
  description?: string;
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

const SOURCE_TYPE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'turbo_form', label: 'Formulário Turbo' },
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Redes Sociais' },
  { value: 'referral', label: 'Indicação' },
  { value: 'event', label: 'Evento' },
  { value: 'cold_outreach', label: 'Prospecção Ativa' },
  { value: 'other', label: 'Outros' }
];

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ 
  companyId, 
  source = 'manual',
  sourceType = 'manual',
  onSuccess, 
  onCancel,
  className = '',
  title = 'Captação de Lead',
  description = 'Preencha os dados abaixo para capturar um novo lead'
}) => {
  const { toast } = useToast();
  const { createLead } = useLeads(companyId);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<LeadCaptureFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: [],
    source_type: sourceType,
    notes: '',
    lgpd_consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'Nome completo é obrigatório';
        if (value.trim().split(' ').length < 2) return 'Digite nome e sobrenome';
        if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        if (value.length > 100) return 'Nome deve ter no máximo 100 caracteres';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
        return '';
      
      case 'email':
        if (!value?.trim()) return 'Email é obrigatório';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Email inválido';
        if (value.length > 254) return 'Email muito longo';
        return '';
      
      case 'phone':
        if (!value?.trim()) return 'Telefone é obrigatório';
        const digitsOnly = value.replace(/[^0-9]/g, '');
        if (digitsOnly.length < 8) return 'Telefone deve ter pelo menos 8 dígitos';
        if (digitsOnly.length > 15) return 'Telefone deve ter no máximo 15 dígitos';
        if (!/^[\+]?[1-9][\d\s\-\(\)]{8,20}$/.test(value)) return 'Formato de telefone inválido';
        return '';
      
      case 'company':
        if (!value?.trim()) return 'Empresa é obrigatória';
        if (value.length < 2) return 'Nome da empresa deve ter pelo menos 2 caracteres';
        if (value.length > 200) return 'Nome da empresa deve ter no máximo 200 caracteres';
        return '';
      
      case 'position':
        if (!value?.trim()) return 'Cargo é obrigatório';
        if (value.length < 2) return 'Cargo deve ter pelo menos 2 caracteres';
        if (value.length > 100) return 'Cargo deve ter no máximo 100 caracteres';
        return '';
      
      case 'lgpd_consent':
        if (!value) return 'Você deve aceitar os termos de privacidade para continuar';
        return '';
      
      case 'notes':
        if (value && value.length > 1000) return 'Notas devem ter no máximo 1000 caracteres';
        return '';
      
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field on change if it was already touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof LeadCaptureFormData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    handleFieldChange('interests', newInterests);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['name', 'email', 'phone', 'company', 'position', 'lgpd_consent'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof LeadCaptureFormData]);
      if (error) newErrors[field] = error;
    });

    // Validate optional fields if they have content
    if (formData.notes) {
      const notesError = validateField('notes', formData.notes);
      if (notesError) newErrors.notes = notesError;
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      company: true,
      position: true,
      lgpd_consent: true,
      notes: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os erros no formulário antes de continuar.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const leadData: CreateLeadData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        position: formData.position.trim(),
        interests: formData.interests,
        source,
        source_type: formData.source_type,
        notes: formData.notes.trim() || undefined,
        lgpd_consent: formData.lgpd_consent,
      };

      await createLead(leadData);
      
      setSubmitted(true);
      
      toast({
        title: 'Lead cadastrado com sucesso!',
        description: 'Obrigado pelo seu interesse. Entraremos em contato em breve.',
      });

      if (onSuccess) {
        onSuccess('mock-lead-id');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Erro ao cadastrar lead',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      interests: [],
      source_type: sourceType,
      notes: '',
      lgpd_consent: false,
    });
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-800">Lead Cadastrado com Sucesso!</h3>
              <p className="text-muted-foreground mt-2">
                Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetForm} variant="outline">
                Cadastrar Novo Lead
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="default">
                  Voltar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Obrigatórios */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Campos Obrigatórios</span>
            </div>
            
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Empresa *
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Nome da sua empresa"
                value={formData.company}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                onBlur={() => handleFieldBlur('company')}
                className={errors.company ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.company && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.company}
                </p>
              )}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Cargo *
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="Seu cargo na empresa"
                value={formData.position}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                onBlur={() => handleFieldBlur('position')}
                className={errors.position ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.position && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.position}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Campos Opcionais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Informações Adicionais (Opcional)</span>
            </div>

            {/* Interesses */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Áreas de Interesse
              </Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique nas áreas que mais interessam para personalizar nossa abordagem
              </p>
            </div>

            {/* Fonte */}
            <div className="space-y-2">
              <Label htmlFor="source_type">Fonte do Lead</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value) => handleFieldChange('source_type', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fonte" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais, comentários ou observações..."
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                onBlur={() => handleFieldBlur('notes')}
                className={errors.notes ? 'border-red-500' : ''}
                disabled={loading}
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.notes}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.notes.length}/1000 caracteres
              </p>
            </div>
          </div>

          <Separator />

          {/* LGPD Consent */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Consentimento LGPD</span>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Seus dados pessoais serão utilizados exclusivamente para contato comercial e 
                apresentação de nossos produtos e serviços. Você pode solicitar a exclusão 
                dos seus dados a qualquer momento.
              </AlertDescription>
            </Alert>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="lgpd_consent"
                checked={formData.lgpd_consent}
                onCheckedChange={(checked) => handleFieldChange('lgpd_consent', checked)}
                onBlur={() => handleFieldBlur('lgpd_consent')}
                className={errors.lgpd_consent ? 'border-red-500' : ''}
                disabled={loading}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="lgpd_consent" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Aceito os termos de privacidade e autorizo o uso dos meus dados *
                </Label>
                {errors.lgpd_consent && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lgpd_consent}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Cadastrar Lead
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCaptureForm;