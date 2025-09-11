import React from 'react';
import { Edit, ExternalLink, Calendar, User, Briefcase, Phone, Mail, FileText, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Candidate } from '@/types/interviews';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '@/types/interviews';

interface CandidateDetailsProps {
  candidate: Candidate;
  onEdit: () => void;
  onClose: () => void;
}

const EXPERIENCE_LEVELS = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
};

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({
  candidate,
  onEdit,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
            <p className="text-gray-600">{candidate.position}</p>
            <Badge className={CANDIDATE_STATUS_COLORS[candidate.status]}>
              {CANDIDATE_STATUS_LABELS[candidate.status]}
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
        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a 
                  href={`mailto:${candidate.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
            </div>

            {candidate.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <a 
                    href={`tel:${candidate.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {candidate.phone}
                  </a>
                </div>
              </div>
            )}

            {candidate.linkedin_url && (
              <div className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">LinkedIn</p>
                  <a 
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Ver Perfil
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {candidate.resume_url && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Currículo</p>
                  <a 
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Ver Currículo
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Cargo Pretendido</p>
              <p className="font-medium">{candidate.position}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-500">Nível de Experiência</p>
              <p className="font-medium">{EXPERIENCE_LEVELS[candidate.experience_level]}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-500">Status Atual</p>
              <Badge className={CANDIDATE_STATUS_COLORS[candidate.status]}>
                {CANDIDATE_STATUS_LABELS[candidate.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Data de Cadastro</p>
              <p className="font-medium">{formatDate(candidate.created_at)}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-500">Última Atualização</p>
              <p className="font-medium">{formatDate(candidate.updated_at)}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-gray-500">ID do Candidato</p>
              <p className="font-mono text-xs text-gray-600">{candidate.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {candidate.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Entrevistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Entrevistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma entrevista agendada</p>
            <Button variant="outline" size="sm">
              Agendar Entrevista
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Candidato
        </Button>
      </div>
    </div>
  );
};