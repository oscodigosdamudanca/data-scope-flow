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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const currentField = FORM_STEPS[currentStep].fieldName;
    if (!formData[currentField] && currentField !== 'lgpd_consent') {
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