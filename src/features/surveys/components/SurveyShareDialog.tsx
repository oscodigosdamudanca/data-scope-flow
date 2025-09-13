import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, QrCode, Share2, CheckCircle, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Survey } from '@/types/surveys';

interface SurveyShareDialogProps {
  survey: Survey;
  isOpen: boolean;
  onClose: () => void;
}

const SurveyShareDialog: React.FC<SurveyShareDialogProps> = ({
  survey,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  
  // Gerar URL única para o survey
  const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}`;
  
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: 'Copiado!',
        description: `${type} copiado para a área de transferência.`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar para a área de transferência.',
        variant: 'destructive',
      });
    }
  };
  
  const openInNewTab = () => {
    window.open(surveyUrl, '_blank');
  };
  
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: survey.title,
          text: survey.description || 'Participe desta pesquisa',
          url: surveyUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback to copying URL
      copyToClipboard(surveyUrl, 'URL');
    }
  };
  
  const generateEmbedCode = () => {
    return `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;
  };
  
  const embedCode = generateEmbedCode();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Pesquisa
          </DialogTitle>
          <DialogDescription>
            Compartilhe sua pesquisa através de diferentes canais e formatos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações da pesquisa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{survey.title}</CardTitle>
              {survey.description && (
                <p className="text-sm text-muted-foreground">{survey.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={survey.is_active ? 'default' : 'secondary'}>
                  {survey.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
                <Badge variant="outline">
                  <Globe className="w-3 h-3 mr-1" />
                  Pública
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* URL da pesquisa */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">URL da Pesquisa</Label>
            <div className="flex gap-2">
              <Input
                value={surveyUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(surveyUrl, 'URL')}
                className="shrink-0"
              >
                {copied === 'URL' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                className="shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">QR Code</Label>
            <div className="flex items-start gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <img
                  src={qrCodeUrl}
                  alt="QR Code da Pesquisa"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Escaneie este QR Code para acessar a pesquisa diretamente no celular.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCodeUrl;
                    link.download = `qr-code-${survey.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
                    link.click();
                  }}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Baixar QR Code
                </Button>
              </div>
            </div>
          </div>
          
          {/* Código de incorporação */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Código de Incorporação</Label>
            <p className="text-sm text-muted-foreground">
              Use este código para incorporar a pesquisa em seu site ou blog.
            </p>
            <div className="flex gap-2">
              <Input
                value={embedCode}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(embedCode, 'Código')}
                className="shrink-0"
              >
                {copied === 'Código' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Botões de compartilhamento */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Compartilhar</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={shareViaWebAPI}
                className="justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const subject = encodeURIComponent(`Pesquisa: ${survey.title}`);
                  const body = encodeURIComponent(
                    `Olá!\n\nGostaria de convidá-lo(a) para participar da nossa pesquisa: "${survey.title}"\n\n${survey.description || ''}\n\nAcesse através do link: ${surveyUrl}\n\nObrigado!`
                  );
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Email
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const text = encodeURIComponent(
                    `Participe da nossa pesquisa: "${survey.title}" ${surveyUrl}`
                  );
                  window.open(`https://wa.me/?text=${text}`);
                }}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const text = encodeURIComponent(
                    `Participe da nossa pesquisa: "${survey.title}" ${surveyUrl}`
                  );
                  window.open(`https://twitter.com/intent/tweet?text=${text}`);
                }}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
          
          {/* Dicas de uso */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">💡 Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              <p>• A pesquisa deve estar <strong>ativa</strong> para receber respostas</p>
              <p>• O QR Code é ideal para eventos presenciais e materiais impressos</p>
              <p>• Use o código de incorporação para adicionar a pesquisa em sites</p>
              <p>• Compartilhe a URL diretamente em redes sociais e emails</p>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyShareDialog;