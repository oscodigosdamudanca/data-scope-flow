import React from 'react';
import { Edit, Calendar, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { QuestionType } from '@/types/questions';
import { CATEGORY_COLORS, DIFFICULTY_COLORS } from '@/types/questions';

interface QuestionTypeDetailsProps {
  questionType: QuestionType;
  onClose: () => void;
  onEdit: () => void;
}

export const QuestionTypeDetails: React.FC<QuestionTypeDetailsProps> = ({
  questionType,
  onClose,
  onEdit
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      technical: 'Técnica',
      behavioral: 'Comportamental',
      cultural: 'Cultural',
      situational: 'Situacional',
      general: 'Geral'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{questionType.title}</DialogTitle>
          <DialogDescription>
            Detalhes completos do tipo de pergunta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge 
                variant="secondary" 
                className={`${CATEGORY_COLORS[questionType.category]} text-white`}
              >
                {getCategoryLabel(questionType.category)}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${DIFFICULTY_COLORS[questionType.difficulty]} border-current`}
              >
                {getDifficultyLabel(questionType.difficulty)}
              </Badge>
            </div>

            {questionType.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-600 leading-relaxed">
                  {questionType.description}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {questionType.tags && questionType.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {questionType.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Informações do Sistema</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Criado em: {formatDate(questionType.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Atualizado em: {formatDate(questionType.updated_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Criado por: {questionType.created_by}</span>
              </div>
              
              {questionType.company_id && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>Empresa: {questionType.company_id}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                questionType.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600">
                Status: {questionType.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
            <div className="text-sm text-gray-600">
              <p>Perguntas associadas: {(questionType as any).questions_count || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                * Estatísticas são atualizadas em tempo real
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};