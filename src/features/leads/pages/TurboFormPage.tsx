import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Share2, Copy } from 'lucide-react';
// Importação temporária para desenvolvimento
const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          single: async () => ({ data: { id: '123', questions: [] }, error: null })
        })
      })
    })
  })
};
// Mock temporário do contexto de autenticação
const useAuth = () => ({ user: { id: 'user-123' } });
import TurboLeadForm from '@/components/TurboLeadForm';
import PageTitle from '@/components/PageTitle';
import LoadingSpinner from '@/components/LoadingSpinner';

export const TurboFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        if (!user) return;
        
        // Busca a configuração do formulário Turbo
        const { data, error } = await supabase
          .from('form_configurations')
          .select('*')
          .eq('type', 'turbo_form')
          .eq('created_by', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setFormData(data);
          setShareUrl(`${window.location.origin}/leads/turbo/public/${data.id}`);
        }
      } catch (error) {
        console.error('Erro ao carregar formulário:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o formulário.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [user, toast]);

  const handleGoToAdmin = () => {
    navigate('/leads/turbo/admin');
  };

  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copiado!',
        description: 'O link de compartilhamento foi copiado para a área de transferência.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Formulário Turbo" />
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleGoToAdmin}>
            <Settings className="h-4 w-4 mr-2" />
            Administrar
          </Button>
        </div>
      </div>
      
      {formData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Link para compartilhamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="bg-muted p-2 rounded flex-1 text-sm truncate">
                {shareUrl}
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(shareUrl, '_blank')}>
                <Share2 className="h-4 w-4 mr-2" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Formulário de Captação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <TurboLeadForm 
            customQuestions={formData?.questions || []} 
            onSubmitSuccess={() => {
              toast({
                title: 'Lead cadastrado!',
                description: 'O lead foi cadastrado com sucesso.',
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormPage;