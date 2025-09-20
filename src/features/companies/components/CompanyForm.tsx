import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building, Loader2 } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      cnpj: company?.cnpj || '',
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    console.log('🔍 [CompanyForm] Iniciando onSubmit');
    console.log('🔍 [CompanyForm] Dados do formulário:', data);
    console.log('🔍 [CompanyForm] Usuário atual:', user);
    
    if (!user) {
      console.error('❌ [CompanyForm] Usuário não autenticado!');
      toast({
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para criar uma empresa.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const companyData = {
        name: data.name,
        cnpj: data.cnpj || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        created_by: user.id,
      };

      console.log('🔍 [CompanyForm] Dados preparados para envio:', companyData);

      if (company) {
        console.log('🔍 [CompanyForm] Atualizando empresa existente:', company.id);
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) {
          console.error('❌ [CompanyForm] Erro ao atualizar empresa:', error);
          throw error;
        }
        
        console.log('✅ [CompanyForm] Empresa atualizada com sucesso');
        toast({
          title: 'Empresa atualizada',
          description: 'As informações da empresa foram atualizadas com sucesso.',
        });
      } else {
        console.log('🔍 [CompanyForm] Criando nova empresa');
        const { data: insertedData, error } = await supabase
          .from('companies')
          .insert([companyData])
          .select();

        console.log('🔍 [CompanyForm] Resposta do Supabase:', { insertedData, error });

        if (error) {
          console.error('❌ [CompanyForm] Erro ao criar empresa:', error);
          console.error('❌ [CompanyForm] Detalhes do erro:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('✅ [CompanyForm] Empresa criada com sucesso:', insertedData);
        toast({
          title: 'Empresa criada',
          description: 'A nova empresa foi criada com sucesso.',
        });
      }

      console.log('✅ [CompanyForm] Operação concluída, chamando onSuccess');
      onSuccess?.();
    } catch (error) {
      console.error('❌ [CompanyForm] Erro geral:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar empresa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('🔍 [CompanyForm] Finalizando onSubmit');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {company ? 'Editar Empresa' : 'Nova Empresa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome comercial da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
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
                    <Input placeholder="(11) 99999-9999" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo da empresa"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {company ? 'Atualizar' : 'Criar'} Empresa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CompanyForm;