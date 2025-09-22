import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Plus, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { leadAIService, LeadQuestionSuggestion, LeadAIRequest } from '@/services/leadAIService';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIQuestionRecommendationsProps {
  onAddQuestion: (question: LeadQuestionSuggestion) => void;
  existingQuestions?: string[];
  companyInfo?: {
    name?: string;
    industry?: string;
    targetAudience?: string;
  };
  className?: string;
}

export function AIQuestionRecommendations({
  onAddQuestion,
  existingQuestions = [],
  companyInfo,
  className = ''
}: AIQuestionRecommendationsProps) {
  const [suggestions, setSuggestions] = useState<LeadQuestionSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [aiRequest, setAiRequest] = useState<LeadAIRequest>({
    companyName: companyInfo?.name || '',
    industry: companyInfo?.industry || '',
    targetAudience: companyInfo?.targetAudience || '',
    eventType: 'feira corporativa',
    questionCount: 5,
    existingQuestions,
    focusAreas: ['budget', 'timeline', 'decision_maker']
  });
  const { toast } = useToast();

  // Carrega sugestões iniciais
  useEffect(() => {
    if (companyInfo?.name || companyInfo?.industry) {
      generateSuggestions();
    }
  }, [companyInfo]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await leadAIService.generateLeadQuestions({
        ...aiRequest,
        existingQuestions
      });
      
      setSuggestions(response.suggestions);
      
      toast({
        title: "Sugestões geradas!",
        description: `${response.suggestions.length} perguntas sugeridas pela IA`,
      });
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({
        title: "Erro ao gerar sugestões",
        description: "Usando perguntas padrão como alternativa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (suggestion: LeadQuestionSuggestion) => {
    onAddQuestion(suggestion);
    // Remove a sugestão da lista após adicionar
    setSuggestions(prev => prev.filter(s => s.question_text !== suggestion.question_text));
    
    toast({
      title: "Pergunta adicionada!",
      description: "A pergunta foi adicionada ao formulário",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'qualification': return '🎯';
      case 'interest': return '💡';
      case 'contact': return '📞';
      case 'demographic': return '👥';
      default: return '❓';
    }
  };

  const updateFocusAreas = (area: string, checked: boolean) => {
    setAiRequest(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...(prev.focusAreas || []), area]
        : (prev.focusAreas || []).filter(a => a !== area)
    }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Recomendações de IA</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                Configurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSuggestions}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Gerar
              </Button>
            </div>
          </div>
          <CardDescription>
            Perguntas inteligentes sugeridas para qualificar seus leads de forma mais eficiente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {showConfig && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <h4 className="font-medium">Configurações da IA</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={aiRequest.companyName || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Ex: TechCorp Solutions"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Setor/Indústria</Label>
                  <Input
                    id="industry"
                    value={aiRequest.industry || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Ex: Tecnologia, Saúde, Educação"
                  />
                </div>
                
                <div>
                  <Label htmlFor="target-audience">Público-alvo</Label>
                  <Input
                    id="target-audience"
                    value={aiRequest.targetAudience || ''}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Ex: Gestores de TI, Diretores"
                  />
                </div>
                
                <div>
                  <Label htmlFor="question-count">Número de Perguntas</Label>
                  <Select
                    value={aiRequest.questionCount?.toString() || '5'}
                    onValueChange={(value) => setAiRequest(prev => ({ ...prev, questionCount: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 perguntas</SelectItem>
                      <SelectItem value="5">5 perguntas</SelectItem>
                      <SelectItem value="7">7 perguntas</SelectItem>
                      <SelectItem value="10">10 perguntas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Áreas de Foco</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { key: 'budget', label: 'Orçamento' },
                    { key: 'timeline', label: 'Cronograma' },
                    { key: 'decision_maker', label: 'Tomador de Decisão' },
                    { key: 'pain_points', label: 'Dores/Problemas' },
                    { key: 'competition', label: 'Concorrência' },
                    { key: 'urgency', label: 'Urgência' }
                  ].map(area => (
                    <label key={area.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(aiRequest.focusAreas || []).includes(area.key)}
                        onChange={(e) => updateFocusAreas(area.key, e.target.checked)}
                        className="rounded"
                      />
                      {area.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Gerando sugestões inteligentes...</span>
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Clique em "Gerar" para obter sugestões de perguntas personalizadas</p>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Sugestões Personalizadas ({suggestions.length})
              </h4>
              
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(suggestion.priority)}
                          >
                            {suggestion.priority === 'high' ? 'Alta' : 
                             suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                          </Badge>
                          <Badge variant="secondary">
                            {suggestion.category === 'qualification' ? 'Qualificação' :
                             suggestion.category === 'interest' ? 'Interesse' :
                             suggestion.category === 'contact' ? 'Contato' : 'Demografia'}
                          </Badge>
                        </div>
                        
                        <p className="font-medium text-gray-900">
                          {suggestion.question_text}
                        </p>
                        
                        {suggestion.options && suggestion.options.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Opções:</strong> {suggestion.options.join(', ')}
                          </div>
                        )}
                        
                        {suggestion.reasoning && (
                          <p className="text-sm text-gray-600 italic">
                            💡 {suggestion.reasoning}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAddQuestion(suggestion)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}