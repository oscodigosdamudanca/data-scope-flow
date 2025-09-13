import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, BarChart3, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSurveys } from '../hooks/useSurveys';
import { useSurveyResponses } from '../hooks/useSurveyResponses';
import { Survey, CreateSurveyData, UpdateSurveyData, SurveyFilters } from '@/types/surveys';
import SurveyShareDialog from './SurveyShareDialog';

const SurveyManager: React.FC = () => {
  const { surveys, loading, error, createSurvey, updateSurvey, deleteSurvey, refetch } = useSurveys();
  const { responses } = useSurveyResponses();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filters, setFilters] = useState<SurveyFilters & { search?: string }>({
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    total_responses: 0
  });

  // Calculate stats from surveys data
  const calculateStats = useCallback(() => {
    const total = surveys.length;
    const active = surveys.filter(s => s.is_active).length;
    const inactive = total - active;
    const total_responses = responses.length;
    
    setStats({ total, active, inactive, total_responses });
  }, [surveys, responses]);

  // Use calculated stats from state
  const calculatedStats = stats;

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    is_active: false
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const handleCreateSurvey = async () => {
    const surveyData: CreateSurveyData = {
      title: formData.title,
      description: formData.description,
      is_active: formData.is_active
    };
    const success = await createSurvey(surveyData);
    if (success) {
      setIsCreateDialogOpen(false);
      setFormData({ title: '', description: '', is_active: false });
    }
  };

  const handleEditSurvey = async () => {
    if (!selectedSurvey) return;
    
    const updateData = {
      title: formData.title,
      description: formData.description,
      is_active: formData.is_active
    };
    
    const success = await updateSurvey(selectedSurvey.id, updateData);
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedSurvey(null);
      setFormData({ title: '', description: '', is_active: false });
    }
  };

  const handleDeleteSurvey = async (survey: Survey) => {
    const success = await deleteSurvey(survey.id);
    if (success) {
      // Survey já foi removido da lista pelo hook
    }
  };

  const openEditDialog = (survey: Survey) => {
    setSelectedSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description || '',
      is_active: survey.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openAnalyticsDialog = async (survey: Survey) => {
    setSelectedSurvey(survey);
    // Calculate analytics from responses data
     const surveyResponses = responses.filter(r => r.survey_id === survey.id);
     const analyticsData = {
       totalResponses: surveyResponses.length,
       uniqueRespondents: new Set(surveyResponses.map(r => r.respondent_email).filter(Boolean)).size,
       responsesByQuestion: {}
     };
    setAnalytics(analyticsData);
    setIsAnalyticsDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Ativa' : 'Rascunho'}
      </Badge>
    );
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = !filters.search || 
      survey.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      survey.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && surveys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pesquisas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pesquisas</h1>
          <p className="text-muted-foreground">Gerencie pesquisas e colete feedback dos participantes</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Pesquisa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Pesquisa</DialogTitle>
              <DialogDescription>
                Crie uma nova pesquisa para coletar feedback dos participantes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da pesquisa"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo da pesquisa"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Pesquisa ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSurvey} disabled={!formData.title.trim()}>
                Criar Pesquisa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respostas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats.total_responses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar pesquisas..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

      </div>

      {/* Lista de pesquisas */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  {survey.description && (
                    <CardDescription>{survey.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(survey.is_active)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Criada em {new Date(survey.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setIsShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAnalyticsDialog(survey)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(survey)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a pesquisa "{survey.title}"? 
                          Esta ação não pode ser desfeita e todas as respostas serão perdidas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSurvey(survey)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSurveys.length === 0 && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma pesquisa encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search 
              ? 'Tente ajustar os filtros para encontrar pesquisas.'
              : 'Comece criando sua primeira pesquisa.'}
          </p>
          {!filters.search && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Pesquisa
            </Button>
          )}
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pesquisa</DialogTitle>
            <DialogDescription>
              Atualize as informações da pesquisa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da pesquisa"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo da pesquisa"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-is_active">Pesquisa ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSurvey} disabled={!formData.title.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de analytics */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analytics - {selectedSurvey?.title}</DialogTitle>
            <DialogDescription>
              Visualize as estatísticas e respostas da pesquisa.
            </DialogDescription>
          </DialogHeader>
          {analytics && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalResponses}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Respondentes Únicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.uniqueRespondents}</div>
                  </CardContent>
                </Card>
              </div>
              
              {Object.keys(analytics.responsesByQuestion).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Respostas por Pergunta</h4>
                  <div className="space-y-4">
                    {Object.entries(analytics.responsesByQuestion).map(([questionId, data]: [string, any]) => (
                      <Card key={questionId}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{data.question?.question_text}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-semibold">
                            {data.responses.length} resposta(s)
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de compartilhamento */}
      {selectedSurvey && (
        <SurveyShareDialog
          survey={selectedSurvey}
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false);
            setSelectedSurvey(null);
          }}
        />
      )}
    </div>
  );
};

export default SurveyManager;