import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCandidates } from '../hooks/useCandidates';
import type { Interview, InterviewStatus, Candidate } from '@/types/interviews';
import { INTERVIEW_STATUS_LABELS } from '@/types/interviews';

const interviewSchema = z.object({
  candidate_id: z.string().min(1, 'Candidato é obrigatório'),
  position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  scheduled_at: z.string().min(1, 'Data e hora são obrigatórias'),
  duration_minutes: z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
  status: z.enum(['agendada', 'em_andamento', 'finalizada', 'cancelada']),
  interview_type: z.enum(['presencial', 'online', 'telefone']),
  location: z.string().optional(),
  meeting_url: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

interface InterviewFormProps {
  interview?: Interview | null;
  onSubmit: (data: InterviewFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const INTERVIEW_TYPES = {
  presencial: 'Presencial',
  online: 'Online',
  telefone: 'Telefone',
};

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
];

export const InterviewForm: React.FC<InterviewFormProps> = ({
  interview,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const { candidates } = useCandidates({ status: 'novo' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      candidate_id: interview?.candidate_id || '',
      position: interview?.position || '',
      scheduled_at: interview?.scheduled_at ? 
        new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
      duration_minutes: interview?.duration_minutes || 60,
      status: interview?.status || 'agendada',
      interview_type: interview?.interview_type || 'online',
      location: interview?.location || '',
      meeting_url: interview?.meeting_url || '',
      notes: interview?.notes || '',
    },
  });

  const watchedCandidateId = watch('candidate_id');
  const watchedInterviewType = watch('interview_type');
  const watchedStatus = watch('status');
  const watchedDuration = watch('duration_minutes');

  useEffect(() => {
    if (watchedCandidateId) {
      const candidate = candidates.find(c => c.id === watchedCandidateId);
      setSelectedCandidate(candidate || null);
      if (candidate && !interview) {
        setValue('position', candidate.position);
      }
    }
  }, [watchedCandidateId, candidates, setValue, interview]);

  const handleFormSubmit = (data: InterviewFormData) => {
    // Convert scheduled_at to ISO string
    const formattedData = {
      ...data,
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      location: data.location || undefined,
      meeting_url: data.meeting_url || undefined,
      notes: data.notes || undefined,
    };
    onSubmit(formattedData);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Mínimo 30 minutos no futuro
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate_id">Candidato *</Label>
                <Select
                  value={watchedCandidateId}
                  onValueChange={(value) => setValue('candidate_id', value)}
                >
                  <SelectTrigger className={errors.candidate_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{candidate.name}</span>
                          <span className="text-sm text-gray-500">{candidate.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.candidate_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.candidate_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  {...register('position')}
                  placeholder="Ex: Desenvolvedor Frontend"
                  className={errors.position ? 'border-red-500' : ''}
                />
                {errors.position && (
                  <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) => setValue('status', value as InterviewStatus)}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTERVIEW_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agendamento */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Agendamento</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduled_at">Data e Hora *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  min={getMinDateTime()}
                  {...register('scheduled_at')}
                  className={errors.scheduled_at ? 'border-red-500' : ''}
                />
                {errors.scheduled_at && (
                  <p className="text-sm text-red-500 mt-1">{errors.scheduled_at.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="duration_minutes">Duração *</Label>
                <Select
                  value={watchedDuration.toString()}
                  onValueChange={(value) => setValue('duration_minutes', parseInt(value))}
                >
                  <SelectTrigger className={errors.duration_minutes ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.duration_minutes && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration_minutes.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="interview_type">Tipo de Entrevista *</Label>
                <Select
                  value={watchedInterviewType}
                  onValueChange={(value) => setValue('interview_type', value as any)}
                >
                  <SelectTrigger className={errors.interview_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTERVIEW_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.interview_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.interview_type.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Local/Link */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Local e Acesso</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchedInterviewType === 'presencial' && (
              <div className="md:col-span-2">
                <Label htmlFor="location">Local da Entrevista</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Ex: Sala de reuniões 1, Escritório Central"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                )}
              </div>
            )}

            {watchedInterviewType === 'online' && (
              <div className="md:col-span-2">
                <Label htmlFor="meeting_url">Link da Reunião</Label>
                <Input
                  id="meeting_url"
                  type="url"
                  {...register('meeting_url')}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className={errors.meeting_url ? 'border-red-500' : ''}
                />
                {errors.meeting_url && (
                  <p className="text-sm text-red-500 mt-1">{errors.meeting_url.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Observações</h3>
          
          <div>
            <Label htmlFor="notes">Notas da Entrevista</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre a entrevista, tópicos a abordar, etc..."
              rows={4}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Candidato Selecionado */}
      {selectedCandidate && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Candidato Selecionado</h3>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{selectedCandidate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedCandidate.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{selectedCandidate.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cargo Pretendido</p>
                  <p className="font-medium">{selectedCandidate.position}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {interview ? 'Atualizando...' : 'Agendando...'}
            </div>
          ) : (
            interview ? 'Atualizar Entrevista' : 'Agendar Entrevista'
          )}
        </Button>
      </div>
    </form>
  );
};