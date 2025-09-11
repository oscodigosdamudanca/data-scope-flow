import React from 'react';
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
import type { Candidate, CandidateStatus } from '@/types/interviews';
import { CANDIDATE_STATUS_LABELS } from '@/types/interviews';

const candidateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  experience_level: z.enum(['junior', 'pleno', 'senior', 'especialista']),
  status: z.enum(['novo', 'em_analise', 'aprovado', 'reprovado', 'contratado']),
  resume_url: z.string().url('URL inválida').optional().or(z.literal('')),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  candidate?: Candidate | null;
  onSubmit: (data: CandidateFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EXPERIENCE_LEVELS = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
};

export const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: candidate?.name || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      position: candidate?.position || '',
      experience_level: candidate?.experience_level || 'junior',
      status: candidate?.status || 'novo',
      resume_url: candidate?.resume_url || '',
      linkedin_url: candidate?.linkedin_url || '',
      notes: candidate?.notes || '',
    },
  });

  const watchedStatus = watch('status');
  const watchedExperienceLevel = watch('experience_level');

  const handleFormSubmit = (data: CandidateFormData) => {
    // Remove empty strings for optional fields
    const cleanData = {
      ...data,
      phone: data.phone || undefined,
      resume_url: data.resume_url || undefined,
      linkedin_url: data.linkedin_url || undefined,
      notes: data.notes || undefined,
    };
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Digite o nome completo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(11) 99999-9999"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Informações Profissionais</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="position">Cargo Pretendido *</Label>
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
                <Label htmlFor="experience_level">Nível de Experiência *</Label>
                <Select
                  value={watchedExperienceLevel}
                  onValueChange={(value) => setValue('experience_level', value as any)}
                >
                  <SelectTrigger className={errors.experience_level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPERIENCE_LEVELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experience_level && (
                  <p className="text-sm text-red-500 mt-1">{errors.experience_level.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) => setValue('status', value as CandidateStatus)}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
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
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links e Observações */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Links e Observações</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="resume_url">URL do Currículo</Label>
              <Input
                id="resume_url"
                type="url"
                {...register('resume_url')}
                placeholder="https://exemplo.com/curriculo.pdf"
                className={errors.resume_url ? 'border-red-500' : ''}
              />
              {errors.resume_url && (
                <p className="text-sm text-red-500 mt-1">{errors.resume_url.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                type="url"
                {...register('linkedin_url')}
                placeholder="https://linkedin.com/in/usuario"
                className={errors.linkedin_url ? 'border-red-500' : ''}
              />
              {errors.linkedin_url && (
                <p className="text-sm text-red-500 mt-1">{errors.linkedin_url.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre o candidato..."
              rows={4}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

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
              {candidate ? 'Atualizando...' : 'Salvando...'}
            </div>
          ) : (
            candidate ? 'Atualizar Candidato' : 'Salvar Candidato'
          )}
        </Button>
      </div>
    </form>
  );
};