import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useLeads } from '@/hooks/useLeads';
import { useNotifications } from '@/hooks/useNotifications';
import { CreateLeadData } from '@/types/leads';

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Você precisa concordar com os termos de uso de dados'
  })
});

type FormValues = z.infer<typeof formSchema>;

interface TurboLeadFormProps {
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
}

export const TurboLeadForm: React.FC<TurboLeadFormProps> = ({ onSuccess, onCancel }) => {
  const { createLead } = useLeads();
  const { notifyTurboLeadCreated } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      notes: '',
      lgpd_consent: false
    }
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const leadData: CreateLeadData = {
        ...data,
        source_type: 'turbo_form',
        source: 'manual',
        priority: 'medium',
        interests: []
      };

      const leadId = await createLead(leadData);
      
      // Criar notificação para o novo lead
      if (leadId) {
        try {
          notifyTurboLeadCreated({
            id: leadId,
            ...leadData,
            company_id: leadData.company_id || '',
            status: 'new',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (notifyError) {
          console.error('Erro ao criar notificação:', notifyError);
          // Continuar o fluxo mesmo se a notificação falhar
        }
      }
      
      if (onSuccess) {
        onSuccess(leadId);
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome*</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Seu cargo na empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais relevantes" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lgpd_consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Concordo com o uso dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD)*
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { TurboLeadForm as default };