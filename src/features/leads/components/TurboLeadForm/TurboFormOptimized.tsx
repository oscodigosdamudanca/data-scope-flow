import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/hooks/useLeads';
import { useNotifications } from '@/hooks/useNotifications';
import { useCompany } from '@/contexts/CompanyContext';
import { CreateLeadData } from '@/types/leads';
import { AIQuestionRecommendations } from '@/components/forms/AIQuestionRecommendations';
import { LeadQuestionSuggestion } from '@/services/leadAIService';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Target,
  Shield,
  Settings,
  Lightbulb,
  MapPin,
  FileText
} from 'lucide-react';

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' }),
  address: z.string().optional(),
  observations: z.string().optional(),
  interest_area: z.array(z.string()).min(1, { message: 'Selecione pelo menos uma área de interesse' }),
  budget_range: z.string().min(1, { message: 'Selecione uma faixa de orçamento' }),
  urgency_level: z.string().min(1, { message: 'Selecione o nível de urgência' }),

  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Você precisa concordar com os termos de uso de dados'
  })
});

type FormValues = z.infer<typeof formSchema>;

// Configuração das etapas do formulário
const FORM_STEPS = [
  {
    id: 'personal-info',
    title: 'Informações Pessoais',
    icon: User,
    fields: ['name', 'email', 'phone']
  },
  {
    id: 'additional-info',
    title: 'Informações Adicionais',
    icon: Building,
    fields: ['address', 'observations']
  },
  {
    id: 'interests',
    title: 'Área de Interesse',
    icon: Target,
    fields: ['interest_area']
  },
  {
    id: 'qualification',
    title: 'Qualificação',
    icon: CheckCircle,
    fields: ['budget_range', 'urgency_level']
  },
  {
    id: 'consent',
    title: 'Consentimento',
    icon: Shield,
    fields: ['lgpd_consent']
  }
];

// Opções de múltipla escolha
const INTEREST_AREAS = [
  { value: 'tecnologia', label: 'Tecnologia e Inovação', color: 'bg-blue-100 text-blue-800' },
  { value: 'marketing', label: 'Marketing Digital', color: 'bg-green-100 text-green-800' },
  { value: 'vendas', label: 'Vendas e CRM', color: 'bg-purple-100 text-purple-800' },
  { value: 'rh', label: 'Recursos Humanos', color: 'bg-orange-100 text-orange-800' },
  { value: 'financas', label: 'Finanças e Controladoria', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'operacoes', label: 'Operações e Logística', color: 'bg-red-100 text-red-800' },
  { value: 'consultoria', label: 'Consultoria Empresarial', color: 'bg-indigo-100 text-indigo-800' }
];

const BUDGET_RANGES = [
  { value: 'ate-10k', label: 'Até R$ 10.000', description: 'Projetos pequenos' },
  { value: '10k-50k', label: 'R$ 10.000 a R$ 50.000', description: 'Projetos médios' },
  { value: '50k-100k', label: 'R$ 50.000 a R$ 100.000', description: 'Projetos grandes' },
  { value: 'acima-100k', label: 'Acima de R$ 100.000', description: 'Projetos enterprise' },
  { value: 'nao-definido', label: 'Ainda não definido', description: 'Em fase de planejamento' }
];

const URGENCY_LEVELS = [
  { value: 'imediato', label: 'Imediato', description: 'Preciso começar agora', color: 'text-red-600' },
  { value: '30-dias', label: 'Até 30 dias', description: 'Próximo mês', color: 'text-orange-600' },
  { value: '90-dias', label: 'Até 90 dias', description: 'Próximo trimestre', color: 'text-yellow-600' },
  { value: '6-meses', label: 'Até 6 meses', description: 'Planejamento futuro', color: 'text-green-600' },
  { value: 'sem-pressa', label: 'Sem pressa', description: 'Apenas explorando', color: 'text-blue-600' }
];


interface TurboFormOptimizedProps {
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
  companyInfo?: {
    name?: string;
    industry?: string;
    targetAudience?: string;
  };
  showAIRecommendations?: boolean;
}

export const TurboFormOptimized: React.FC<TurboFormOptimizedProps> = ({ 
  onSuccess, 
  onCancel,
  companyInfo,
  showAIRecommendations = true
}) => {
  const { createLead } = useLeads();
  const { notifyTurboLeadCreated } = useNotifications();
  const { currentCompany } = useCompany();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<LeadQuestionSuggestion[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      observations: '',
      interest_area: [],
      budget_range: '',
      urgency_level: '',
      lgpd_consent: false
    }
  });

  const currentStepConfig = FORM_STEPS[currentStep];
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  const handleNext = async () => {
    const currentFields = currentStepConfig.fields;
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setSubmitting(true);
    
    try {
      const formData = form.getValues();
      
      // Adiciona informações das perguntas customizadas de IA
      const customQuestionsData = customQuestions.map(q => ({
        question: q.question_text,
        category: q.category,
        priority: q.priority,
        reasoning: q.reasoning
      }));
      
      const leadData: CreateLeadData = {
        name: formData.name,
        email: formData.email || '',
        phone: formData.phone,
        company: '',
        position: '',
        source_type: 'turbo_form',
        source: 'manual',
        priority: formData.urgency_level === 'imediato' ? 'high' : 
                 formData.urgency_level === '30-dias' ? 'medium' : 'low',
        interests: formData.interest_area,
        notes: `Áreas de interesse: ${formData.interest_area.map(area => 
          INTEREST_AREAS.find(a => a.value === area)?.label || area
        ).join(', ')}
Orçamento: ${BUDGET_RANGES.find(b => b.value === formData.budget_range)?.label || formData.budget_range}
Urgência: ${URGENCY_LEVELS.find(u => u.value === formData.urgency_level)?.label || formData.urgency_level}
${formData.address ? `\nEndereço: ${formData.address}` : ''}
${formData.observations ? `\nObservações: ${formData.observations}` : ''}

${customQuestionsData.length > 0 ? `
Perguntas Personalizadas de IA:
${customQuestionsData.map((q, i) => `${i + 1}. ${q.question} (${q.category}, prioridade: ${q.priority})`).join('\n')}
` : ''}`
      };

      const leadId = await createLead(leadData);
      
      if (leadId) {
        try {
          notifyTurboLeadCreated({
            id: leadId,
            ...leadData,
            company_id: leadData.company_id || '',
            status: 'new',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (notifyError) {
          console.error('Erro ao criar notificação:', notifyError);
        }
      }
      
      setCompleted(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(leadId), 2000);
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const StepIcon = currentStepConfig.icon;

    if (completed) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-700 mb-2">
            Cadastro Realizado com Sucesso!
          </h3>
          <p className="text-gray-600 mb-4">
            Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.
          </p>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Lead #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </Badge>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header da etapa */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <StepIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            {currentStepConfig.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Etapa {currentStep + 1} de {FORM_STEPS.length}
          </p>
        </div>

        {/* Conteúdo da etapa */}
        <div className="space-y-4">
          {currentStep === 0 && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome Completo *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Profissional
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {currentStep === 1 && (
            <>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite seu endereço completo (rua, número, bairro, cidade, estado, CEP)"
                        className="min-h-[100px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Observações (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Compartilhe informações adicionais, necessidades específicas ou comentários que possam nos ajudar a atendê-lo melhor..."
                        className="min-h-[100px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {currentStep === 2 && (
            <FormField
              control={form.control}
              name="interest_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    Quais áreas mais te interessam? * (Selecione uma ou mais opções)
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      {INTEREST_AREAS.map((area) => (
                        <div key={area.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={area.value}
                            checked={field.value?.includes(area.value) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, area.value]);
                              } else {
                                field.onChange(currentValue.filter((value) => value !== area.value));
                              }
                            }}
                          />
                          <Label 
                            htmlFor={area.value} 
                            className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{area.label}</span>
                              <Badge className={area.color} variant="secondary">
                                {area.value}
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Qual é sua faixa de orçamento? *
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3 mt-4"
                      >
                        {BUDGET_RANGES.map((budget) => (
                          <div key={budget.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={budget.value} id={budget.value} />
                            <Label 
                              htmlFor={budget.value} 
                              className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{budget.label}</span>
                                <span className="text-sm text-gray-500">{budget.description}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Qual é o nível de urgência? *
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3 mt-4"
                      >
                        {URGENCY_LEVELS.map((urgency) => (
                          <div key={urgency.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={urgency.value} id={urgency.value} />
                            <Label 
                              htmlFor={urgency.value} 
                              className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className={`font-medium ${urgency.color}`}>
                                  {urgency.label}
                                </span>
                                <span className="text-sm text-gray-500">{urgency.description}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="lgpd_consent"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                          Proteção de Dados Pessoais
                        </h4>
                        <p className="text-sm text-blue-800 mb-4">
                          Seus dados serão utilizados exclusivamente para entrarmos em contato 
                          e apresentarmos nossas soluções. Não compartilhamos informações com terceiros 
                          e você pode solicitar a exclusão dos seus dados a qualquer momento.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Concordo com o uso dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD) *
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Ao marcar esta opção, você autoriza o contato da nossa equipe comercial.
                      </p>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          Formulário Turbo
          {showAIRecommendations && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="ml-2 p-2 h-8 w-8"
              title="Recomendações de IA"
            >
              <Lightbulb className={`w-4 h-4 ${showAIPanel ? 'text-yellow-500' : 'text-gray-400'}`} />
            </Button>
          )}
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500">
            {Math.round(progress)}% concluído
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        {showAIRecommendations && showAIPanel && (
          <div className="mb-6">
            <AIQuestionRecommendations
              companyInfo={companyInfo}
              onSuggestionsGenerated={(suggestions) => setCustomQuestions(suggestions)}
              existingQuestions={customQuestions}
            />
          </div>
        )}
        
        <Form {...form}>
          <form className="space-y-6">
            {renderStepContent()}
            
            {!completed && (
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || submitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onCancel}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : currentStep === FORM_STEPS.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TurboFormOptimized;