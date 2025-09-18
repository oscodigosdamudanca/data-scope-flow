import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

interface TurboLeadFormProps {
  companyId?: string;
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const FORM_STEPS = [
  {
    id: 'step-1',
    question: 'Qual é o seu nome completo?',
    type: 'text',
    fieldName: 'name'
  },
  {
    id: 'step-2',
    question: 'Qual é o seu e-mail profissional?',
    type: 'email',
    fieldName: 'email'
  },
  {
    id: 'step-3',
    question: 'Qual é o seu telefone de contato?',
    type: 'tel',
    fieldName: 'phone'
  },
  {
    id: 'step-4',
    question: 'Qual área mais te interessa?',
    type: 'radio',
    fieldName: 'interest',
    options: [
      { value: 'tecnologia', label: 'Tecnologia' },
      { value: 'marketing', label: 'Marketing Digital' },
      { value: 'vendas', label: 'Vendas' },
      { value: 'rh', label: 'Recursos Humanos' },
      { value: 'financas', label: 'Finanças' }
    ]
  },
  {
    id: 'step-5',
    question: 'Qual é o seu orçamento aproximado?',
    type: 'radio',
    fieldName: 'budget',
    options: [
      { value: 'ate-5k', label: 'Até R$ 5.000' },
      { value: '5k-15k', label: 'R$ 5.000 a R$ 15.000' },
      { value: '15k-50k', label: 'R$ 15.000 a R$ 50.000' },
      { value: 'acima-50k', label: 'Acima de R$ 50.000' },
      { value: 'nao-definido', label: 'Ainda não definido' }
    ]
  }
];

const TurboLeadForm: React.FC<TurboLeadFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    budget: '',
    lgpd_consent: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const currentField = FORM_STEPS[currentStep].fieldName;
    if (!formData[currentField as keyof typeof formData] && currentField !== 'lgpd_consent') {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, preencha este campo para continuar.',
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitForm();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitForm = async () => {
    if (!formData.lgpd_consent) {
      toast({
        title: 'Consentimento necessário',
        description: 'Por favor, aceite os termos de privacidade para continuar.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Integração com Supabase será implementada aqui
      const leadData = {
        ...formData,
        company_id: companyId,
        source_type: 'turbo_form',
        created_at: new Date().toISOString()
      };
      
      console.log('Lead data to be sent:', leadData);
      
      // Simulação de envio para o Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      
      toast({
        title: 'Lead cadastrado com sucesso!',
        description: 'Obrigado pelo seu interesse. Entraremos em contato em breve.',
      });

      if (onSuccess) {
        onSuccess('mock-lead-id');
      }
    } catch (error) {
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
      interest: '',
      budget: '',
      lgpd_consent: false
    });
    setCurrentStep(0);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800">Lead Cadastrado com Sucesso!</h3>
            <p className="text-muted-foreground">
              Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
            </p>
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

  const currentFormStep = FORM_STEPS[currentStep];
  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const renderFormStepContent = () => {
    if (currentFormStep.type === 'text' || currentFormStep.type === 'email' || currentFormStep.type === 'tel') {
      return (
        <Input
          type={currentFormStep.type}
          value={formData[currentFormStep.fieldName as keyof typeof formData] || ''}
          onChange={(e) => handleInputChange(currentFormStep.fieldName, e.target.value)}
          placeholder={`Digite seu ${currentFormStep.fieldName === 'name' ? 'nome completo' : 
            currentFormStep.fieldName === 'email' ? 'e-mail profissional' : 'telefone com DDD'}`}
        />
      );
    }

    if (currentFormStep.type === 'radio' && currentFormStep.options) {
      return (
        <RadioGroup
          value={formData[currentFormStep.fieldName as keyof typeof formData] || ''}
          onValueChange={(value) => handleInputChange(currentFormStep.fieldName, value)}
          className="space-y-3"
        >
          {currentFormStep.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    return null;
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-center text-xl">
          Formulário Turbo
        </CardTitle>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / (FORM_STEPS.length + 1)) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-medium">{currentFormStep.question}</h3>
          </div>

          {renderFormStepContent()}

          {isLastStep && (
            <div className="pt-4">
              <div className="flex items-start space-x-3 pb-4">
                <Checkbox
                  id="lgpd_consent"
                  checked={formData.lgpd_consent || false}
                  onCheckedChange={(checked) => 
                    handleInputChange('lgpd_consent', checked === true)
                  }
                />
                <div>
                  <Label 
                    htmlFor="lgpd_consent" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Aceito os termos de privacidade e autorizo o uso dos meus dados *
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={isFirstStep ? onCancel : handlePrevious}
              disabled={loading}
            >
              {isFirstStep ? 'Cancelar' : 'Anterior'}
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {isLastStep ? 'Finalizar' : 'Próximo'}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurboLeadForm;