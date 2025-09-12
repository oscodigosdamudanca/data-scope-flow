import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCandidates } from '../hooks/useCandidates';
import { useUsers } from '@/features/admin/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import type { Interview, InterviewFormData } from '@/types/interviews';

interface InterviewFormProps {
  interview?: Interview | null;
  onSubmit: (data: InterviewFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InterviewForm: React.FC<InterviewFormProps> = ({
  interview,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { user } = useAuth();
  const { candidates, isLoading: candidatesLoading } = useCandidates();
  const { users, loading: usersLoading } = useUsers();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<InterviewFormData>({
    defaultValues: {
      title: interview?.title || '',
      description: interview?.description || '',
      candidate_id: interview?.candidate_id || '',
      interviewer_id: interview?.interviewer_id || '',
      scheduled_at: interview?.scheduled_at ? 
        new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
      meeting_url: interview?.meeting_url || '',
      notes: interview?.notes || '',
      company_id: user?.user_metadata?.company_id || '',
      status: interview?.status || 'scheduled'
    }
  });
  
  const candidateId = watch('candidate_id');
  const interviewerId = watch('interviewer_id');
  
  // Filtrar usuários que podem ser entrevistadores (admin, interviewer, developer)
  const interviewers = users.filter(user => 
    user.roles?.some(role => ['admin', 'interviewer', 'developer'].includes(role))
  );

  const handleFormSubmit = (data: InterviewFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título da Entrevista *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Título é obrigatório' })}
            placeholder="Ex: Entrevista Técnica - Desenvolvedor"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="scheduled_at">Data e Hora *</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            {...register('scheduled_at', { required: 'Data e hora são obrigatórios' })}
          />
          {errors.scheduled_at && (
            <p className="text-sm text-red-600 mt-1">{errors.scheduled_at.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="candidate_id">Candidato *</Label>
          <Select
            value={candidateId}
            onValueChange={(value) => setValue('candidate_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um candidato" />
            </SelectTrigger>
            <SelectContent>
              {candidatesLoading ? (
                <SelectItem value="" disabled>Carregando candidatos...</SelectItem>
              ) : candidates.length === 0 ? (
                <SelectItem value="" disabled>Nenhum candidato disponível</SelectItem>
              ) : (
                candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register('candidate_id', { required: 'Candidato é obrigatório' })}
          />
          {errors.candidate_id && (
            <p className="text-sm text-red-600 mt-1">{errors.candidate_id.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="interviewer_id">Entrevistador</Label>
          <Select
            value={interviewerId}
            onValueChange={(value) => setValue('interviewer_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um entrevistador (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {usersLoading ? (
                <SelectItem value="" disabled>Carregando entrevistadores...</SelectItem>
              ) : interviewers.length === 0 ? (
                <SelectItem value="" disabled>Nenhum entrevistador disponível</SelectItem>
              ) : (
                interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.display_name || interviewer.email} ({interviewer.roles?.join(', ')})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register('interviewer_id')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descreva o objetivo da entrevista..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="meeting_url">URL da Reunião</Label>
        <Input
          id="meeting_url"
          {...register('meeting_url')}
          placeholder="https://meet.google.com/..."
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações sobre a entrevista..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : interview ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};