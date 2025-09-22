import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// Mock temporário do Supabase
const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { id: '123', questions: [] }, error: null })
      })
    })
  })
};
import TurboLeadForm from '@/components/TurboLeadForm';
import LoadingSpinner from '@/components/LoadingSpinner';

const TurboFormPublicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('ID do formulário não fornecido');
        }
        
        // Busca a configuração do formulário pelo ID
        const { data, error } = await supabase
          .from('form_configurations')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Formulário não encontrado');
        }
        
        setFormData(data);
      } catch (error) {
        console.error('Erro ao carregar formulário:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o formulário. Verifique o link e tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [id, toast]);

  const handleSubmitSuccess = useCallback(() => {
    setSubmitted(true);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!formData) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-destructive">Formulário não encontrado</h2>
              <p className="mt-2">O formulário que você está procurando não existe ou foi removido.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary">Obrigado!</h2>
              <p className="mt-2">Seu formulário foi enviado com sucesso.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{formData.name || 'Formulário Turbo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <TurboLeadForm 
            customQuestions={formData.questions || []} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormPublicPage;