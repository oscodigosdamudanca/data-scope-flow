import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clipboard, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TurboLeadForm from '../components/TurboLeadForm';

const TurboFormDirectAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // URL para acesso direto ao formulário
  const directAccessUrl = window.location.origin + '/leads/turbo';
  
  // Função para copiar a URL para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(directAccessUrl)
      .then(() => {
        toast({
          title: 'URL copiada!',
          description: 'A URL de acesso direto foi copiada para a área de transferência.',
        });
      })
      .catch(() => {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar a URL. Tente novamente.',
          variant: 'destructive',
        });
      });
  };
  
  // Função para compartilhar a URL
  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Formulário Turbo - DataScope',
          text: 'Acesse o formulário Turbo para cadastro rápido de leads:',
          url: directAccessUrl,
        });
        
        toast({
          title: 'URL compartilhada!',
          description: 'A URL de acesso direto foi compartilhada com sucesso.',
        });
      } catch (error) {
        toast({
          title: 'Erro ao compartilhar',
          description: 'Não foi possível compartilhar a URL. Tente novamente.',
          variant: 'destructive',
        });
      }
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard}>
            <Clipboard className="mr-2 h-4 w-4" />
            Copiar URL
          </Button>
          
          <Button onClick={shareUrl}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Acesso Direto ao Formulário Turbo</CardTitle>
          <CardDescription>
            Esta página fornece acesso direto ao formulário Turbo para captura rápida de leads.
            Compartilhe esta URL com sua equipe para facilitar o acesso durante eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md mb-6 overflow-x-auto">
            <code className="text-sm">{directAccessUrl}</code>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Visualização do Formulário</h3>
            <TurboLeadForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormDirectAccessPage;