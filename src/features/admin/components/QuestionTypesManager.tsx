import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuestionTypes } from '../hooks/useQuestionTypes';
import { QuestionTypeForm } from './QuestionTypeForm';
import { QuestionTypeDetails } from './QuestionTypeDetails';
import type { QuestionType, QuestionCategory, QuestionDifficulty } from '@/types/questions';
import { CATEGORY_COLORS, DIFFICULTY_COLORS } from '@/types/questions';

export const QuestionTypesManager: React.FC = () => {
  const {
    questionTypes,
    loading,
    createQuestionType,
    updateQuestionType,
    deleteQuestionType,
    isCreating,
    isUpdating,
    isDeleting
  } = useQuestionTypes();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionTypeToDelete, setQuestionTypeToDelete] = useState<QuestionType | null>(null);

  // Filter question types
  const filteredQuestionTypes = questionTypes.filter(qt => {
    const matchesSearch = qt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || qt.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || qt.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleCreate = () => {
    setSelectedQuestionType(null);
    setShowForm(true);
  };

  const handleEdit = (questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setShowForm(true);
  };

  const handleView = (questionType: QuestionType) => {
    setSelectedQuestionType(questionType);
    setShowDetails(true);
  };

  const handleDelete = (questionType: QuestionType) => {
    setQuestionTypeToDelete(questionType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (questionTypeToDelete) {
      await deleteQuestionType(questionTypeToDelete.id);
      setDeleteDialogOpen(false);
      setQuestionTypeToDelete(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedQuestionType(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedQuestionType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Perguntas</h1>
          <p className="text-gray-600">Gerencie os tipos de perguntas para entrevistas</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tipos de perguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as QuestionCategory | 'all')}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="technical">Técnica</SelectItem>
                  <SelectItem value="behavioral">Comportamental</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="situational">Situacional</SelectItem>
                  <SelectItem value="general">Geral</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as QuestionDifficulty | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Types Grid */}
      {filteredQuestionTypes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                  ? 'Nenhum tipo de pergunta encontrado com os filtros aplicados.'
                  : 'Nenhum tipo de pergunta cadastrado ainda.'}
              </p>
              {!searchTerm && categoryFilter === 'all' && difficultyFilter === 'all' && (
                <Button onClick={handleCreate} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro tipo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestionTypes.map((questionType) => (
            <Card key={questionType.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{questionType.title}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(questionType)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(questionType)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(questionType)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {questionType.description && (
                  <CardDescription className="line-clamp-2">
                    {questionType.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${CATEGORY_COLORS[questionType.category]} text-white`}
                    >
                      {questionType.category === 'technical' && 'Técnica'}
                      {questionType.category === 'behavioral' && 'Comportamental'}
                      {questionType.category === 'cultural' && 'Cultural'}
                      {questionType.category === 'situational' && 'Situacional'}
                      {questionType.category === 'general' && 'Geral'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${DIFFICULTY_COLORS[questionType.difficulty]} border-current`}
                    >
                      {questionType.difficulty === 'easy' && 'Fácil'}
                      {questionType.difficulty === 'medium' && 'Médio'}
                      {questionType.difficulty === 'hard' && 'Difícil'}
                    </Badge>
                  </div>
                  
                  {questionType.tags && questionType.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {questionType.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {questionType.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{questionType.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {(questionType as any).questions_count || 0} pergunta(s)
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <QuestionTypeForm
          questionType={selectedQuestionType}
          onClose={handleFormClose}
          onSubmit={selectedQuestionType ? 
            async (data: any) => {
              await updateQuestionType(selectedQuestionType.id, data);
            } : 
            async (data: any) => {
              await createQuestionType(data);
            }
          }
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* Details Modal */}
      {showDetails && selectedQuestionType && (
        <QuestionTypeDetails
          questionType={selectedQuestionType}
          onClose={handleDetailsClose}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tipo de pergunta "{questionTypeToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};