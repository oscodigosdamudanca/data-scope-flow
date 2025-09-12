import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { aiService, AIQuestionSuggestion, generateQuestionsWithFallback } from '@/services/aiService';
import { CreateSurveyQuestionData } from '@/types/surveys';
import { toast } from '@/hooks/use-toast';

interface AIQuestionGeneratorProps {
  surveyTitle: string;
  surveyDescription?: string;
  existingQuestions?: string[];
  onQuestionsGenerated: (questions: CreateSurveyQuestionData[]) => void;
  disabled?: boolean;
}

const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  surveyTitle,
  surveyDescription,
  existingQuestions = [],
  onQuestionsGenerated,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AIQuestionSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [reasoning, setReasoning] = useState('');
  
  // Configurações avançadas
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!surveyTitle.trim()) {
      toast({
        title: "Erro",
        description: "Título da pesquisa é obrigatório para gerar sugestões",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());

    try {
      const result = await generateQuestionsWithFallback(surveyTitle, {
        surveyDescription,
        targetAudience: targetAudience.trim() || undefined,
        industry: industry.trim() || undefined,
        questionCount,
        existingQuestions
      });

      if (result.isAIGenerated) {
        // Se foi gerado por IA, precisamos buscar as sugestões completas
        const response = await aiService.generateQuestionSuggestions({
          surveyTitle,
          surveyDescription,
          targetAudience: targetAudience.trim() || undefined,
          industry: industry.trim() || undefined,
          questionCount,
          existingQuestions
        });
        
        setSuggestions(response.suggestions);
        setConfidence(response.confidence);
        setReasoning(response.reasoning);
        setIsAIGenerated(true);
        
        // Seleciona todas as sugestões por padrão
        setSelectedSuggestions(new Set(response.suggestions.map((_, index) => index)));
        
        toast({
          title: "Sugestões geradas!",
          description: `${response.suggestions.length} perguntas foram sugeridas pela IA`,
        });
      } else {
        // Fallback - converte para formato de sugestões
        const fallbackSuggestions: AIQuestionSuggestion[] = result.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          reasoning: "Pergunta padrão gerada automaticamente"
        }));
        
        setSuggestions(fallbackSuggestions);
        setConfidence(0.6);
        setReasoning("Perguntas padrão geradas devido à indisponibilidade da IA");
        setIsAIGenerated(false);
        
        // Seleciona todas as sugestões por padrão
        setSelectedSuggestions(new Set(fallbackSuggestions.map((_, index) => index)));
        
        toast({
          title: "Perguntas padrão geradas",
          description: "IA indisponível. Usando perguntas padrão baseadas no contexto.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({
        title: "Erro ao gerar sugestões",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelection = (index: number) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedSuggestions(newSelection);
  };

  const handleApplySelected = () => {
    const selectedQuestions: CreateSurveyQuestionData[] = suggestions
      .filter((_, index) => selectedSuggestions.has(index))
      .map((suggestion, index) => ({
        question_text: suggestion.question_text,
        question_type: suggestion.question_type,
        options: suggestion.options,
        is_required: false,
        order_index: existingQuestions.length + index
      }));

    onQuestionsGenerated(selectedQuestions);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    
    toast({
      title: "Perguntas adicionadas!",
      description: `${selectedQuestions.length} perguntas foram adicionadas à pesquisa`,
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      text: 'Texto',
      multiple_choice: 'Múltipla Escolha',
      rating: 'Avaliação',
      boolean: 'Sim/Não'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      multiple_choice: 'bg-green-100 text-green-800',
      rating: 'bg-yellow-100 text-yellow-800',
      boolean: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled || !surveyTitle.trim()}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Gerar Perguntas com IA
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Gerador de Perguntas com IA
          </DialogTitle>
          <DialogDescription>
            Use inteligência artificial para gerar perguntas relevantes para sua pesquisa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da pesquisa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contexto da Pesquisa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-muted-foreground mt-1">{surveyTitle}</p>
              </div>
              {surveyDescription && (
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground mt-1">{surveyDescription}</p>
                </div>
              )}
              {existingQuestions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Perguntas Existentes</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {existingQuestions.length} pergunta(s) já criada(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações avançadas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Configurações
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Ocultar' : 'Avançado'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionCount">Número de Perguntas</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              
              {showAdvanced && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetAudience">Público-alvo</Label>
                      <Input
                        id="targetAudience"
                        placeholder="Ex: Visitantes de feira, Clientes, Funcionários"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Setor/Indústria</Label>
                      <Input
                        id="industry"
                        placeholder="Ex: Tecnologia, Saúde, Educação"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botão de gerar */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !surveyTitle.trim()}
              className="gap-2"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Sugestões'}
            </Button>
          </div>

          {/* Resultados */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sugestões Geradas</span>
                  <div className="flex items-center gap-2">
                    {isAIGenerated ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        IA
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Padrão
                      </Badge>
                    )}
                    <Badge variant="outline">
                      Confiança: {Math.round(confidence * 100)}%
                    </Badge>
                  </div>
                </CardTitle>
                {reasoning && (
                  <p className="text-sm text-muted-foreground">{reasoning}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSuggestions.has(index) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleToggleSelection(index)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getQuestionTypeColor(suggestion.question_type)}>
                              {getQuestionTypeLabel(suggestion.question_type)}
                            </Badge>
                            {selectedSuggestions.has(index) && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <h4 className="font-medium mb-2">{suggestion.question_text}</h4>
                          {suggestion.options && suggestion.options.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Opções:</span>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {suggestion.options.map((option, optIndex) => (
                                  <li key={optIndex}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {suggestion.reasoning && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {suggestion.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {suggestions.length > 0 && (
                <span>{selectedSuggestions.size} de {suggestions.length} selecionadas</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              {suggestions.length > 0 && (
                <Button 
                  onClick={handleApplySelected}
                  disabled={selectedSuggestions.size === 0}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Selecionadas ({selectedSuggestions.size})
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuestionGenerator;