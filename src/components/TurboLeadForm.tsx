import React, { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export type QuestionType = {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox';
  question: string;
  options?: string[];
  required: boolean;
};

interface TurboLeadFormProps {
  customQuestions?: QuestionType[];
  formId?: string;
  onSubmitSuccess?: () => void;
}

const TurboLeadForm: React.FC<TurboLeadFormProps> = ({
  customQuestions = [],
  formId,
  onSubmitSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Usando useCallback para evitar recriações desnecessárias da função
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lgpdConsent) {
      alert("Por favor, aceite os termos de consentimento para prosseguir.");
      return;
    }

    try {
      // Código para enviar os dados do formulário
      console.log('Enviando dados:', { ...formData, lgpdConsent });
      
      setIsSubmitting(true);
      
      // Simulação de envio de dados - reduzindo o tempo de espera
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Dados enviados:', {
        ...formData,
        customAnswers: customQuestions.map(q => ({ 
          questionId: q.id, 
          answer: '' 
        })),
        formId,
        lgpdConsent
      });
      
      // Limpar formulário após envio
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: ''
      });
      setLgpdConsent(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [customQuestions, formData, formId, lgpdConsent, onSubmitSuccess]);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos padrão */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Digite seu telefone"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Digite o nome da sua empresa"
              />
            </div>
          </div>

          {/* Consentimento LGPD */}
          <div className="border-t pt-6">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="lgpd-consent"
                checked={lgpdConsent}
                onCheckedChange={(checked) => setLgpdConsent(checked as boolean)}
              />
              <Label htmlFor="lgpd-consent" className="text-sm">
                Concordo com o tratamento dos meus dados pessoais para fins de contato comercial, de acordo com a Lei Geral de Proteção de Dados (LGPD).
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default memo(TurboLeadForm);