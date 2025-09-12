import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Candidate, CandidateFormData, CandidateStatus } from '@/types/interviews';
import { CANDIDATE_STATUS_LABELS } from '@/types/interviews';

interface CandidateFormProps {
  candidate?: Candidate | null;
  onSubmit: (data: CandidateFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { currentCompany } = useCompany();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CandidateFormData>({
    defaultValues: {
      name: candidate?.name || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      resume_url: candidate?.resume_url || '',
      linkedin_url: candidate?.linkedin_url || '',
      portfolio_url: candidate?.portfolio_url || '',
      status: candidate?.status || 'applied',
      notes: candidate?.notes || '',
      company_id: candidate?.company_id || currentCompany?.id || ''
    }
  });

  // Atualizar company_id quando a empresa atual mudar
  useEffect(() => {
    if (currentCompany?.id && !candidate) {
      setValue('company_id', currentCompany.id);
    }
  }, [currentCompany, candidate, setValue]);

  const status = watch('status');

  const handleFormSubmit = (data: CandidateFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Nome é obrigatório' })}
            placeholder="Nome completo do candidato"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
            placeholder="email@exemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setValue('status', value as CandidateStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="resume_url">URL do Currículo</Label>
        <Input
          id="resume_url"
          {...register('resume_url')}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin_url">LinkedIn</Label>
          <Input
            id="linkedin_url"
            {...register('linkedin_url')}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <Label htmlFor="portfolio_url">Portfolio</Label>
          <Input
            id="portfolio_url"
            {...register('portfolio_url')}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações sobre o candidato..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : candidate ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};