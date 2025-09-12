import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useSurveyQuestions } from '../hooks/useSurveyQuestions';
import { CreateSurveyQuestionData, SurveyQuestion } from '@/types/surveys';
import { toast } from '@/hooks/use-toast';
import AIQuestionGenerator from './AIQuestionGenerator';

interface QuestionManagerProps {
  surveyId: string;
  surveyTitle: string;
  surveyDescription?: string;
  onQuestionsChange?: (questions: SurveyQuestion[]) => void;
}

interface QuestionFormData {
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  options: string[];
  is_required: boolean;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
  surveyId,
  surveyTitle,
  surveyDescription,
  onQuestionsChange
}) => {
  const { questions, loading, error, createQuestion, updateQuestion, deleteQuestion } = useSurveyQuestions(surveyId);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: '',
    question_type: 'text',
    options: [''],
    is_required: false
  });

  useEffect(() => {
    if (onQuestionsChange) {
      onQuestionsChange(questions);
    }
  }, [questions, onQuestionsChange]);

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'text',
      options: [''],
      is_required: false
    });
  };

  const handleCreateQuestion = async () => {
    if (!formData.question_text.trim()) {
      toast({
        title: "Erro",
        description: "Texto da pergunta é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const questionData: CreateSurveyQuestionData = {
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: formData.question_type === 'multiple_choice' ? formData.options.filter(opt => opt.trim()) : undefined,
      is_required: formData.is_required,
      order_index: questions.length
    };

    const success = await createQuestion(questionData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Pergunta criada!",
        description: "A pergunta foi adicionada à pesquisa",
      });
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !formData.question_text.trim()) {
      toast({
        title: "Erro",
        description: "Texto da pergunta é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const updateData = {
      question_text: formData.question_text,
      question_type: formData.question_type,
      options: formData.question_type === 'multiple_choice' ? formData.options.filter(opt => opt.trim()) : undefined,
      is_required: formData.is_required
    };

    const success = await updateQuestion(editingQuestion.id, updateData);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      toast({
        title: "Pergunta atualizada!",
        description: "As alterações foram salvas",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const success = await deleteQuestion(questionId);
    if (success) {
      toast({
        title: "Pergunta excluída!",
        description: "A pergunta foi removida da pesquisa",
      });
    }
  };

  const openEditDialog = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || [''],
      is_required: question.is_required
    });
    setIsEditDialogOpen(true);
  };

  const handleAIQuestionsGenerated = async (aiQuestions: CreateSurveyQuestionData[]) => {
    for (const questionData of aiQuestions) {
      await createQuestion({
        ...questionData,
        order_index: questions.length + aiQuestions.indexOf(questionData)
      });
    }
    
    toast({
      title: "Perguntas adicionadas!",
      description: `${aiQuestions.length} perguntas foram criadas com sucesso`,
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      text: 'Texto',
      multiple_choice: 'Múltipla Escolha',
      rating: 'Avaliação',
      boolean: 'Sim/Não'
    };
    return types[type as keyof typeof types] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando perguntas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Perguntas da Pesquisa</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} pergunta(s) criada(s)
          </p>
        </div>
        <div className="flex gap-2">
          <AIQuestionGenerator
            surveyTitle={surveyTitle}
            surveyDescription={surveyDescription}
            existingQuestions={questions.map(q => q.question_text)}
            onQuestionsGenerated={handleAIQuestionsGenerated}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Pergunta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova pergunta à sua pesquisa
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question_text">Texto da Pergunta</Label>
                  <Textarea
                    id="question_text"
                    value={formData.question_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                    placeholder="Digite sua pergunta aqui..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="question_type">Tipo de Pergunta</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, question_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="rating">Avaliação</SelectItem>
                      <SelectItem value="boolean">Sim/Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.question_type === 'multiple_choice' && (
                  <div>
                    <Label>Opções de Resposta</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Opção ${index + 1}`}
                          />
                          {formData.options.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Opção
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={formData.is_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_required">Pergunta obrigatória</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuestion} disabled={!formData.question_text.trim()}>
                  Criar Pergunta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de perguntas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">Nenhuma pergunta criada ainda</p>
              <p className="text-sm">Use o gerador de IA ou crie perguntas manualmente</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      <Badge variant="outline">
                        {getQuestionTypeLabel(question.question_type)}
                      </Badge>
                      {question.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatória
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-2">{question.question_text}</h4>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-1">Opções:</p>
                        <ul className="list-disc list-inside ml-2">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pergunta</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da pergunta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_question_text">Texto da Pergunta</Label>
              <Textarea
                id="edit_question_text"
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="Digite sua pergunta aqui..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_question_type">Tipo de Pergunta</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, question_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="boolean">Sim/Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.question_type === 'multiple_choice' && (
              <div>
                <Label>Opções de Resposta</Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      {formData.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit_is_required">Pergunta obrigatória</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditQuestion} disabled={!formData.question_text.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionManager;