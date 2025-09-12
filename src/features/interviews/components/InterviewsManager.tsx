import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, MoreHorizontal, Eye, Edit, Trash2, Play, Square, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInterviews } from '../hooks/useInterviews';
import { InterviewForm } from './InterviewForm';
import { InterviewDetails } from './InterviewDetails';
import type { Interview, InterviewFilters, InterviewStatus } from '@/types/interviews';
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_COLORS } from '@/types/interviews';

export const InterviewsManager: React.FC = () => {
  const [filters, setFilters] = useState<InterviewFilters>({});
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [interviewToEdit, setInterviewToEdit] = useState<Interview | null>(null);

  const {
    interviews,
    isLoading,
    createInterview,
    updateInterview,
    deleteInterview,
    startInterview,
    finishInterview: completeInterview,
    cancelInterview,
    isCreating,
    isUpdating,
    isDeleting
  } = useInterviews(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as InterviewStatus 
    }));
  };

  const handleCreateInterview = (data: any) => {
    createInterview(data);
    setIsFormOpen(false);
  };

  const handleUpdateInterview = (data: any) => {
    if (interviewToEdit) {
      updateInterview({ id: interviewToEdit.id, updates: data });
      setInterviewToEdit(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteInterview = (interview: Interview) => {
    if (window.confirm(`Tem certeza que deseja remover a entrevista?`)) {
      deleteInterview(interview.id);
    }
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailsOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setInterviewToEdit(interview);
    setIsFormOpen(true);
  };

  const handleStartInterview = (interviewId: string) => {
    if (window.confirm('Tem certeza que deseja iniciar esta entrevista?')) {
      startInterview(interviewId);
    }
  };

  const handleFinishInterview = (interviewId: string) => {
    if (window.confirm('Tem certeza que deseja finalizar esta entrevista?')) {
      finishInterview(interviewId);
    }
  };

  const handleCancelInterview = (interviewId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta entrevista?')) {
      cancelInterview(interviewId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: InterviewStatus) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <Square className="h-4 w-4" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando entrevistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrevistas</h1>
          <p className="text-gray-600">Gerencie entrevistas e processos seletivos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Entrevista
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por candidato ou cargo..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(INTERVIEW_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entrevistas */}
      <Card>
        <CardHeader>
          <CardTitle>Entrevistas ({interviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma entrevista encontrada</p>
              <Button onClick={() => setIsFormOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Primeira Entrevista
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-semibold">{interview.candidate?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{interview.candidate?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{interview.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {interview.scheduled_at ? formatDateTime(interview.scheduled_at) : 'Não agendada'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${INTERVIEW_STATUS_COLORS[interview.status]} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(interview.status)}
                          {INTERVIEW_STATUS_LABELS[interview.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        N/A
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(interview)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            
                            {interview.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => handleStartInterview(interview.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar Entrevista
                              </DropdownMenuItem>
                            )}
                            
                            {interview.status === 'in_progress' && (
                              <DropdownMenuItem onClick={() => handleFinishInterview(interview.id)}>
                                <Square className="h-4 w-4 mr-2" />
                                Finalizar Entrevista
                              </DropdownMenuItem>
                            )}
                            
                            {['scheduled', 'in_progress'].includes(interview.status) && (
                              <DropdownMenuItem onClick={() => handleEditInterview(interview)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            
                            {interview.status === 'scheduled' && (
                              <DropdownMenuItem 
                                onClick={() => handleCancelInterview(interview.id)}
                                className="text-orange-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInterview(interview)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {interviewToEdit ? 'Editar Entrevista' : 'Nova Entrevista'}
            </DialogTitle>
          </DialogHeader>
          <InterviewForm
            interview={interviewToEdit}
            onSubmit={interviewToEdit ? handleUpdateInterview : handleCreateInterview}
            onCancel={() => {
              setIsFormOpen(false);
              setInterviewToEdit(null);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Entrevista</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <InterviewDetails
              interview={selectedInterview}
              onEdit={() => {
                setIsDetailsOpen(false);
                handleEditInterview(selectedInterview);
              }}
              onStart={() => handleStartInterview(selectedInterview.id)}
              onFinish={() => handleFinishInterview(selectedInterview.id)}
              onCancel={() => handleCancelInterview(selectedInterview.id)}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};