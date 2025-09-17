import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '../hooks/useLeads';
import { LeadFormBasic } from './LeadFormBasic';
import LgpdConsent from './LgpdConsent';
import LeadFormFeedback from './LeadFormFeedback';
import { leadFormSchema, type LeadFormData } from './LeadFormValidation';
import { INTEREST_OPTIONS, SOURCE_TYPE_OPTIONS } from '../constants/leadOptions';

interface LeadFormProps {
  companyId: string;
  initialData?: Partial<LeadFormData>;
  mode?: 'create' | 'edit' | 'view';
  leadId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  companyId,
  initialData,
  mode = 'create',
  leadId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { createLead, updateLead } = useLeads(companyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      position: initialData?.position || '',
      interests: initialData?.interests || [],
      source_type: initialData?.source_type || 'manual',
      notes: initialData?.notes || '',
      lgpd_consent: initialData?.lgpd_consent || false
    }
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'edit' && leadId) {
        await updateLead(leadId, {
          ...data,
          company_id: companyId
        });
        toast({
          title: 'Lead atualizado',
          description: 'As informações do lead foram atualizadas com sucesso.',
          variant: 'success'
        });
      } else {
        await createLead({
          ...data,
          company_id: companyId
        });
        toast({
          title: 'Lead capturado',
          description: 'O lead foi capturado com sucesso.',
          variant: 'success'
        });
      }
      setShowFeedback(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o lead. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setShowFeedback(false);
  };

  if (showFeedback) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <LeadFormFeedback 
            mode={mode} 
            onNewLead={handleReset} 
            onBack={onCancel} 
          />
        </CardContent>
      </Card>
    );
  }

  const isViewMode = mode === 'view';

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Editar Lead' : mode === 'view' ? 'Visualizar Lead' : 'Capturar Lead'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <LeadFormBasic 
              form={form} 
              interestOptions={INTEREST_OPTIONS}
              sourceOptions={SOURCE_TYPE_OPTIONS}
              disabled={isViewMode}
            />
            
            {!isViewMode && (
              <LgpdConsent
                checked={form.watch('lgpd_consent')}
                onChange={(checked) => form.setValue('lgpd_consent', checked, { shouldValidate: true })}
                error={form.formState.errors.lgpd_consent?.message}
                disabled={isSubmitting}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {!isViewMode ? (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Salvar'}
                </Button>
              </>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Voltar
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};