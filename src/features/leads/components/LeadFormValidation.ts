import { z } from 'zod';

// Esquema de validação Zod para o formulário de leads
export const leadFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' }).optional(),
  company: z.string().min(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' }).optional(),
  position: z.string().optional(),
  interests: z.array(z.string()).optional(),
  source_type: z.enum(['manual', 'turbo_form', 'qr_code', 'survey', 'website', 'social_media', 'referral', 'event', 'cold_outreach', 'other']),
  notes: z.string().optional(),
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Você precisa concordar com os termos de consentimento LGPD'
  })
});

// Tipo inferido do esquema
export type LeadFormData = z.infer<typeof leadFormSchema>;

// Função para validar o formulário
export const validateLeadForm = (data: LeadFormData): { valid: boolean; errors: Record<string, string> } => {
  try {
    leadFormSchema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: 'Erro de validação desconhecido' } };
  }
};