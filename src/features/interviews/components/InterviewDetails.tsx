import React from 'react';
import { Edit, ExternalLink, Calendar, Clock, User, MapPin, Video, Phone, Play, Square, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Interview } from '@/types/interviews';
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_COLORS } from '@/types/interviews';

interface InterviewDetailsProps {
  interview: Interview;
  onEdit: () => void;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const INTERVIEW_TYPES = {
  presencial: 'Presencial',
  online: 'Online',
  telefone: 'Telefone',
};

const getInterviewTypeIcon = (type: string) => {
  switch (type) {
    case 'presencial':
      return <MapPin className="h-4 w-4" />;
    case 'online':
      return <Video className="h-4 w-4" />;
    case 'telefone':
      return <Phone className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export const InterviewDetails: React.FC<InterviewDetailsProps> = ({
  interview,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onClose,
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const getStatusActions = () => {
    const actions = [];
    
    if (interview.status === 'agendada' && onStart) {
      actions.push(
        <Button key="start" onClick={onStart} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Iniciar Entrevista
        </Button>
      );
    }
    
    if (interview.status === 'em_andamento' && onFinish) {
      actions.push(
        <Button key="finish" onClick={onFinish} className="flex items-center gap-2">
          <Square className="h-4 w-4" />
          Finalizar Entrevista
        </Button>
      );
    }
    
    if (['agendada', 'em_andamento'].includes(interview.status) && onCancel) {
      actions.push(
        <Button key="cancel" onClick={onCancel} variant="outline" className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50">
          <XCircle className="h-4 w-4" />
          Cancelar Entrevista
        </Button>
      );
    }
    
    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {getInterviewTypeIcon(interview.interview_type)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{interview.position}</h2>
            <p className="text-gray-600">{interview.candidate?.name || 'Candidato não encontrado'}</p>
            <Badge className={INTERVIEW_STATUS_COLORS[interview.status]}>
              {INTERVIEW_STATUS_LABELS[interview.status]}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Entrevista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data e Hora</p>
                <p className="font-medium">{formatDateTime(interview.scheduled_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Duração</p>
                <p className="font-medium">{formatDuration(interview.duration_minutes)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getInterviewTypeIcon(interview.interview_type)}
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{INTERVIEW_TYPES[interview.interview_type]}</p>
              </div>
            </div>

            {interview.interview_type === 'presencial' && interview.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium">{interview.location}</p>
                </div>
              </div>
            )}

            {interview.interview_type === 'online' && interview.meeting_url && (
              <div className="flex items-center gap-3">
                <Video className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Link da Reunião</p>
                  <a 
                    href={interview.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Acessar Reunião
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Candidato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interview.candidate ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{interview.candidate.name}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${interview.candidate.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {interview.candidate.email}
                  </a>
                </div>

                {interview.candidate.phone && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <a 
                        href={`tel:${interview.candidate.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {interview.candidate.phone}
                      </a>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-500">Status do Candidato</p>
                  <Badge variant="outline">
                    {interview.candidate.status}
                  </Badge>
                </div>

                {interview.candidate.resume_url && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500">Currículo</p>
                      <a 
                        href={interview.candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Ver Currículo
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-gray-500">Candidato não encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Data de Criação</p>
              <p className="font-medium">{formatDateTime(interview.created_at)}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-500">Última Atualização</p>
              <p className="font-medium">{formatDateTime(interview.updated_at)}</p>
            </div>

            {interview.started_at && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">Iniciada em</p>
                  <p className="font-medium">{formatDateTime(interview.started_at)}</p>
                </div>
              </>
            )}

            {interview.finished_at && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500">Finalizada em</p>
                  <p className="font-medium">{formatDateTime(interview.finished_at)}</p>
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="text-sm text-gray-500">ID da Entrevista</p>
              <p className="font-mono text-xs text-gray-600">{interview.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {interview.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{interview.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perguntas da Entrevista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Perguntas da Entrevista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma pergunta adicionada</p>
            <Button variant="outline" size="sm">
              Adicionar Perguntas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações de Status */}
      {getStatusActions().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações da Entrevista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {getStatusActions()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Entrevista
        </Button>
      </div>
    </div>
  );
};