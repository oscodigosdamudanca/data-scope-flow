import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { register, handleSubmit, formState: { errors } } = useForm<InterviewFormData>({
    defaultValues: {
      title: interview?.title || '',
      description: interview?.description || '',
      candidate_id: interview?.candidate_id || '',
      interviewer_id: interview?.interviewer_id || '',
      company_id: interview?.company_id || '',
      scheduled_at: interview?.scheduled_at ? 
        new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
      meeting_url: interview?.meeting_url || '',
      notes: interview?.notes || '',
      status: interview?.status || 'scheduled'
    }
  });

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