import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Phone, Mail, FileText, Linkedin, Globe, Edit } from 'lucide-react';
import type { Candidate } from '@/types/interviews';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '@/types/interviews';

interface CandidateDetailsProps {
  candidate: Candidate;
  onEdit: () => void;
  onClose: () => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({
  candidate,
  onEdit,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
          <p className="text-gray-600">{candidate.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={CANDIDATE_STATUS_COLORS[candidate.status]}>
            {CANDIDATE_STATUS_LABELS[candidate.status]}
          </Badge>
          <Button onClick={onEdit} size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <a 
                  href={`mailto:${candidate.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
            </div>
            
            {candidate.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`tel:${candidate.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {candidate.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links e Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Links e Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {candidate.resume_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">Currículo</label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4 text-gray-400" />
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

            {candidate.linkedin_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                <div className="flex items-center gap-2 mt-1">
                  <Linkedin className="h-4 w-4 text-gray-400" />
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

            {candidate.portfolio_url && (
              <div>
                <label className="text-sm font-medium text-gray-500">Portfolio</label>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a 
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Ver Portfolio
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {candidate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
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
              <label className="font-medium text-gray-500">Data de Cadastro</label>
              <p className="mt-1">{formatDate(candidate.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Última Atualização</label>
              <p className="mt-1">{formatDate(candidate.updated_at)}</p>
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