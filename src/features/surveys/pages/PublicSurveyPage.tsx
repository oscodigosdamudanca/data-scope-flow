import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, FileText, CheckCircle, Star, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Survey, SurveyQuestion, SubmitSurveyResponseData } from '@/types/surveys';
import { SurveyLeadIntegrationService } from '@/services/surveyLeadIntegration';

interface PublicSurveyFormData {
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  responses: Record<string, any>;
  lgpdConsent: boolean;
}

const PublicSurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PublicSurveyFormData>({
    respondent_name: '',
    respondent_email: '',
    respondent_phone: '',
    responses: {},
    lgpdConsent: false,
  });

  // Mock data - substituir por chamada real à API
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock survey data
        const mockSurvey: Survey = {
          id: surveyId || '1',
          title: 'Pesquisa de Satisfação do Cliente',
          description: 'Sua opinião é muito importante para nós. Por favor, responda às perguntas abaixo para nos ajudar a melhorar nossos serviços.',
          company_id: 'company-1',
          is_active: true,
          status: 'active',
          created_by: 'user-1',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        };
        
        const mockQuestions: SurveyQuestion[] = [
          {
            id: 'q1',
            survey_id: surveyId || '1',
            question_text: 'Como você avalia nosso atendimento?',
            question_type: 'multiple_choice',
            options: ['Excelente', 'Muito Bom', 'Bom', 'Regular', 'Ruim'],
            is_required: true,
            order_index: 1,
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'q2',
            survey_id: surveyId || '1',
            question_text: 'Você recomendaria nossos serviços?',
            question_type: 'boolean',
            is_required: true,
            order_index: 2,
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'q3',
            survey_id: surveyId || '1',
            question_text: 'Dê uma nota de 1 a 5 para nossa qualidade:',
            question_type: 'rating',
            options: ['1', '2', '3', '4', '5'],
            is_required: true,
            order_index: 3,
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'q4',
            survey_id: surveyId || '1',
            question_text: 'Deixe seus comentários e sugestões:',
            question_type: 'text',
            is_required: false,
            order_index: 4,
            created_at: '2024-01-15T10:00:00Z'
          }
        ];
        
        setSurvey(mockSurvey);
        setQuestions(mockQuestions.sort((a, b) => a.order_index - b.order_index));
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a pesquisa.',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId, navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar consentimento LGPD
    if (!formData.lgpdConsent) {
      newErrors.lgpdConsent = 'Você deve aceitar os termos de privacidade para continuar.';
    }

    // Validar respostas obrigatórias
    questions.forEach(question => {
      if (question.is_required && !formData.responses[question.id]) {
        newErrors[question.id] = 'Esta pergunta é obrigatória.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Formulário incompleto',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Preparar dados da resposta do survey
      const responseData: SubmitSurveyResponseData = {
        survey_id: surveyId!,
        respondent_name: formData.respondent_name,
        respondent_email: formData.respondent_email,
        respondent_phone: formData.respondent_phone,
        responses: formData.responses
      };
      
      // Simular delay da API para submissão do survey
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Survey response submitted:', responseData);
      
      // Integração automática com leads
      if (formData.respondent_email && formData.lgpdConsent) {
        try {
          const companyId = survey?.company_id || 'default-company';
          const leadResult = await SurveyLeadIntegrationService.processSurveyResponse(
            responseData,
            companyId
          );
          
          if (leadResult.success && leadResult.leadId) {
            console.log('Lead criado automaticamente:', leadResult.leadId);
            toast({
              title: 'Pesquisa enviada com sucesso!',
              description: 'Obrigado por sua participação. Suas informações foram registradas para futuro contato.',
            });
          } else {
            toast({
              title: 'Pesquisa enviada com sucesso!',
              description: 'Obrigado por sua participação.',
            });
          }
        } catch (leadError) {
          console.error('Erro na integração com leads:', leadError);
          // Não falhar a submissão do survey por erro na criação do lead
          toast({
            title: 'Pesquisa enviada com sucesso!',
            description: 'Obrigado por sua participação.',
          });
        }
      } else {
        toast({
          title: 'Pesquisa enviada com sucesso!',
          description: 'Obrigado por sua participação.',
        });
      }
      
      setSubmitted(true);
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro ao enviar sua resposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
    
    // Limpar erro se existir
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const hasError = !!errors[question.id];
    
    switch (question.question_type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id} className={hasError ? 'text-red-600' : ''}>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={question.id}
              value={formData.responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              placeholder="Digite sua resposta..."
            />
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <Label className={hasError ? 'text-red-600' : ''}>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formData.responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              className={hasError ? 'border border-red-500 rounded-md p-3' : ''}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="space-y-3">
            <Label className={hasError ? 'text-red-600' : ''}>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formData.responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value === 'true')}
              className={hasError ? 'border border-red-500 rounded-md p-3' : ''}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">
                  Sim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="cursor-pointer">
                  Não
                </Label>
              </div>
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );
        
      case 'rating':
        return (
          <div className="space-y-3">
            <Label className={hasError ? 'text-red-600' : ''}>
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={`flex gap-2 ${hasError ? 'p-3 border border-red-500 rounded-md' : ''}`}>
              {question.options?.map((option, index) => {
                const isSelected = formData.responses[question.id] === option;
                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleResponseChange(question.id, option)}
                    className="flex items-center gap-1"
                  >
                    <Star className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                    {option}
                  </Button>
                );
              })}
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg">Carregando pesquisa...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Pesquisa Enviada com Sucesso!
            </h1>
            <p className="text-green-700 mb-6">
              Obrigado por sua participação. Suas respostas são muito importantes para nós.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Pesquisa não encontrada
            </h1>
            <p className="text-red-700 mb-6">
              A pesquisa solicitada não foi encontrada ou não está mais disponível.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">{survey.title}</CardTitle>
                {survey.description && (
                  <p className="text-blue-100 mt-2">{survey.description}</p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações do respondente (opcionais) */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações de Contato (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="respondent_name">Nome</Label>
                    <Input
                      id="respondent_name"
                      value={formData.respondent_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, respondent_name: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="respondent_email">Email</Label>
                    <Input
                      id="respondent_email"
                      type="email"
                      value={formData.respondent_email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, respondent_email: e.target.value }))}
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="respondent_phone">Telefone</Label>
                    <Input
                      id="respondent_phone"
                      value={formData.respondent_phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, respondent_phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Perguntas da pesquisa */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Perguntas da Pesquisa
                </h3>
                
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        {renderQuestion(question)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consentimento LGPD */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-800">
                      Política de Privacidade
                    </h3>
                    
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="lgpdConsent"
                        checked={formData.lgpdConsent}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({ ...prev, lgpdConsent: checked as boolean }));
                          if (errors.lgpdConsent) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.lgpdConsent;
                              return newErrors;
                            });
                          }
                        }}
                        className={errors.lgpdConsent ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="lgpdConsent" className="text-sm cursor-pointer leading-relaxed">
                        Concordo com o tratamento dos meus dados pessoais de acordo com a 
                        <strong> Lei Geral de Proteção de Dados (LGPD)</strong>. 
                        Entendo que meus dados serão utilizados exclusivamente para os fins desta pesquisa 
                        e não serão compartilhados com terceiros sem meu consentimento.
                      </Label>
                    </div>
                    
                    {errors.lgpdConsent && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.lgpdConsent}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-lg"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando Respostas...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Enviar Pesquisa
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

export default PublicSurveyPage;