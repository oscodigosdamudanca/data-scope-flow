import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Share2, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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



// Importação direta para evitar problemas de lazy loading
import TurboFormOptimized from '@/features/leads/components/TurboLeadForm/TurboFormOptimized';
import PageTitle from '@/components/PageTitle';
import LoadingSpinner from '@/components/LoadingSpinner';

export const TurboFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Informações da empresa para as recomendações de IA
  const companyInfo = {
    name: "DataScope",
    industry: "Tecnologia e Software",
    targetAudience: "Empresas que participam de feiras e eventos corporativos"
  };

  const handleSuccess = (leadId: string) => {
    toast({
      title: 'Sucesso!',
      description: 'Lead cadastrado com sucesso!',
    });
    // Sucesso do envio
    navigate(userRole === 'interviewer' ? '/leads/capture' : '/leads');
  };

  const handleCancel = () => {
    navigate(userRole === 'interviewer' ? '/leads/capture' : '/leads');
  };
  // Carregamento inicial dos dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de dados
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Gerar URL de compartilhamento
        const baseUrl = window.location.origin;
        const publicUrl = `${baseUrl}/leads/turbo/public/${user?.id || 'demo'}`;
        setShareUrl(publicUrl);
        
        setFormData({
          companyId: user?.id || 'demo',
          formType: 'turbo'
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar os dados do formulário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, toast]);

  const handleGoToAdmin = () => {
    navigate('/leads/turbo/admin');
  };

  const handleGoToConfig = () => {
    navigate('/leads/turbo/config');
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

  // Mostra um indicador de carregamento mais leve
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Carregando formulário...</p>
        </div>
      </div>
    );
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
          <Button variant="outline" onClick={handleGoToConfig}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Formulário
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
          <CardTitle>Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botões de navegação */}
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={() => navigate('/leads/turbo/direct')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Acessar Agora
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGoToConfig}
              className="px-6 py-3 rounded-lg font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              Configurar Formulário
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGoToAdmin}
              className="px-6 py-3 rounded-lg font-medium border-2 border-green-600 text-green-600 hover:bg-green-50 transition-colors duration-200"
            >
              Administrar
            </Button>
          </div>
          
          <TurboFormOptimized 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            companyInfo={companyInfo}
            showAIRecommendations={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormPage;