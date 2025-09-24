import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '../hooks/useLeads';
import { Lead, CreateLeadData } from '@/types/leads';

interface CreateLeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateLeadForm: React.FC<CreateLeadFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { createLead, loading } = useLeads();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: [] as string[],
    source: 'manual' as const,
    source_type: '',
    notes: '',
    lgpd_consent: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validação de telefone (opcional, mas se preenchido deve ser válido)
    if (formData.phone && !/^[\d\s\(\)\+\-]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone deve conter apenas números e símbolos válidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os erros no formulário.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const newLead: CreateLeadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        interests: formData.interests,
        source: formData.source,
        source_type: 'manual' as const,
        notes: formData.notes || undefined,
        lgpd_consent: formData.lgpd_consent
      };

      await createLead(newLead);
      
      toast({
        title: 'Lead criado com sucesso!',
        description: `${formData.name} foi adicionado à sua lista de leads.`
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/leads/list');
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: 'Erro ao criar lead',
        description: 'Ocorreu um erro ao salvar o lead. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/leads');
    }
  };



  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Criar Novo Lead
        </CardTitle>
        <CardDescription>
          Adicione um novo lead ao seu sistema de gestão
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome completo do lead"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
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
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Cargo ou função"
              />
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Classificação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Fonte</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="qr_code">QR Code</SelectItem>
                    <SelectItem value="survey">Pesquisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_type">Tipo de Fonte</Label>
                <Select
                  value={formData.source_type}
                  onValueChange={(value) => handleInputChange('source_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="turbo_form">Formulário Turbo</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Redes Sociais</SelectItem>
                    <SelectItem value="referral">Indicação</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="cold_outreach">Prospecção Ativa</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interesses</Label>
              <Input
                id="interests"
                value={formData.interests.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
                placeholder="Digite os interesses separados por vírgula"
              />
              <p className="text-sm text-muted-foreground">
                Exemplo: tecnologia, marketing, vendas
              </p>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Adicione observações sobre este lead..."
              rows={3}
            />
          </div>

          {/* LGPD */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lgpd_consent"
                checked={formData.lgpd_consent}
                onChange={(e) => setFormData(prev => ({ ...prev, lgpd_consent: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="lgpd_consent" className="text-sm">
                Consentimento LGPD obtido
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Marque esta opção se o lead consentiu com o tratamento de seus dados pessoais
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview do Lead</Label>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{formData.name || 'Nome do Lead'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.email || 'email@exemplo.com'}
                  </p>
                  {formData.company && (
                    <p className="text-sm text-muted-foreground">
                      {formData.company} {formData.position && `• ${formData.position}`}
                    </p>
                  )}
                  {formData.interests.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Interesses: {formData.interests.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">
                    Novo
                  </Badge>
                  {formData.source && (
                    <Badge variant="outline">
                      {formData.source === 'manual' ? 'Manual' : formData.source === 'qr_code' ? 'QR Code' : 'Pesquisa'}
                    </Badge>
                  )}
                  {formData.lgpd_consent && (
                    <Badge variant="outline" className="text-green-600">
                      LGPD ✓
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateLeadForm;