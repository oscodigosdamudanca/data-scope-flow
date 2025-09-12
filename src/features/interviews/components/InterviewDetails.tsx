import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Calendar, User, Play, Square, XCircle, Edit } from 'lucide-react';
import type { Interview } from '@/types/interviews';
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_COLORS } from '@/types/interviews';

interface InterviewDetailsProps {
  interview: Interview;
  onEdit: () => void;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const InterviewDetails: React.FC<InterviewDetailsProps> = ({
  interview,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onClose
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{interview.title}</h2>
          <p className="text-gray-600">{interview.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={`${INTERVIEW_STATUS_COLORS[interview.status]} flex items-center gap-1`}>
            {interview.status === 'scheduled' && <Calendar className="h-3 w-3" />}
            {interview.status === 'in_progress' && <Play className="h-3 w-3" />}
            {interview.status === 'completed' && <Square className="h-3 w-3" />}
            {(interview.status === 'cancelled' || interview.status === 'no_show') && <XCircle className="h-3 w-3" />}
            {INTERVIEW_STATUS_LABELS[interview.status]}
          </Badge>
          
          {/* Action Buttons */}
          {interview.status === 'scheduled' && (
            <>
              <Button onClick={onStart} size="sm" variant="default">
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
              <Button onClick={onCancel} size="sm" variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}
          
          {interview.status === 'in_progress' && (
            <Button onClick={onFinish} size="sm" variant="default">
              <Square className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
          
          {['scheduled', 'in_progress'].includes(interview.status) && (
            <Button onClick={onEdit} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Informações da Entrevista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-lg font-semibold">{interview.candidate?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p>{interview.candidate?.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Data e Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data e Hora</label>
              <p className="text-lg font-semibold">
                {interview.scheduled_at ? formatDateTime(interview.scheduled_at) : 'Não agendada'}
              </p>
            </div>
            {interview.started_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Iniciada em</label>
                <p>{formatDateTime(interview.started_at)}</p>
              </div>
            )}
            {interview.completed_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Finalizada em</label>
                <p>{formatDateTime(interview.completed_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entrevistador */}
      {interview.interviewer && (
        <Card>
          <CardHeader>
            <CardTitle>Entrevistador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p>{interview.interviewer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p>{interview.interviewer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL da Reunião */}
      {interview.meeting_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Link da Reunião
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a 
              href={interview.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              Acessar reunião
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {interview.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{interview.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Avaliação */}
      {interview.overall_rating && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nota Geral</label>
              <p className="text-2xl font-bold text-blue-600">
                {interview.overall_rating}/5
              </p>
            </div>
            {interview.recommendation && (
              <div>
                <label className="text-sm font-medium text-gray-500">Recomendação</label>
                <p className="text-gray-700 whitespace-pre-wrap">{interview.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Data de Criação</label>
              <p className="mt-1">{formatDate(interview.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Última Atualização</label>
              <p className="mt-1">{formatDate(interview.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </div>
    </div>
  );
};