import React, { useState, useEffect } from 'react';
import { QrCode, Download, Share2, Copy, Eye, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRCodeConfig {
  id: string;
  name: string;
  description?: string;
  targetUrl: string;
  qrCodeUrl: string;
  isActive: boolean;
  leadCount: number;
  createdAt: string;
  campaign?: string;
  source_type: 'qr_code';
}

interface QRCodeLeadCaptureProps {
  companyId?: string;
  className?: string;
}

const QRCodeLeadCapture: React.FC<QRCodeLeadCaptureProps> = ({
  companyId,
  className = ''
}) => {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QRCodeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeConfig | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign: '',
    customFields: [] as string[]
  });

  // Mock data - substituir por dados reais
  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockQRCodes: QRCodeConfig[] = [
          {
            id: 'qr1',
            name: 'Stand Principal - Feira Tech 2024',
            description: 'QR Code para captação de leads no stand principal da feira',
            targetUrl: `${window.location.origin}/lead-capture/qr/qr1`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/lead-capture/qr/qr1`)}`,
            isActive: true,
            leadCount: 47,
            createdAt: '2024-01-15T10:00:00Z',
            campaign: 'Feira Tech 2024',
            source_type: 'qr_code'
          },
          {
            id: 'qr2',
            name: 'Mesa de Demonstração',
            description: 'QR Code para leads interessados em demonstrações',
            targetUrl: `${window.location.origin}/lead-capture/qr/qr2`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/lead-capture/qr/qr2`)}`,
            isActive: true,
            leadCount: 23,
            createdAt: '2024-01-14T14:30:00Z',
            campaign: 'Demonstrações',
            source_type: 'qr_code'
          },
          {
            id: 'qr3',
            name: 'Área de Networking',
            description: 'QR Code para networking e contatos comerciais',
            targetUrl: `${window.location.origin}/lead-capture/qr/qr3`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/lead-capture/qr/qr3`)}`,
            isActive: false,
            leadCount: 12,
            createdAt: '2024-01-13T09:15:00Z',
            campaign: 'Networking',
            source_type: 'qr_code'
          }
        ];
        
        setQrCodes(mockQRCodes);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os QR Codes.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [toast]);

  const handleCreateQRCode = async () => {
    try {
      const qrId = `qr${Date.now()}`;
      const targetUrl = `${window.location.origin}/lead-capture/qr/${qrId}`;
      
      const newQRCode: QRCodeConfig = {
        id: qrId,
        name: formData.name,
        description: formData.description,
        targetUrl,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`,
        isActive: true,
        leadCount: 0,
        createdAt: new Date().toISOString(),
        campaign: formData.campaign,
        source_type: 'qr_code'
      };
      
      setQrCodes(prev => [newQRCode, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', campaign: '', customFields: [] });
      
      toast({
        title: 'QR Code criado com sucesso!',
        description: 'Seu QR Code está pronto para capturar leads.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o QR Code.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'URL copiada!',
        description: 'A URL foi copiada para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a URL.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQRCode = async (qrCode: QRCodeConfig) => {
    try {
      const response = await fetch(qrCode.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${qrCode.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download iniciado!',
        description: 'O QR Code está sendo baixado.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o QR Code.',
        variant: 'destructive',
      });
    }
  };

  const toggleQRCodeStatus = async (qrCodeId: string) => {
    setQrCodes(prev => prev.map(qr => 
      qr.id === qrCodeId ? { ...qr, isActive: !qr.isActive } : qr
    ));
    
    toast({
      title: 'Status atualizado!',
      description: 'O status do QR Code foi alterado.',
    });
  };

  const totalLeads = qrCodes.reduce((sum, qr) => sum + qr.leadCount, 0);
  const activeQRCodes = qrCodes.filter(qr => qr.isActive).length;

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando QR Codes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">QR Codes para Captação</h2>
          <p className="text-muted-foreground">
            Crie e gerencie QR Codes para capturar leads automaticamente
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <QrCode className="w-4 h-4 mr-2" />
              Criar QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo QR Code</DialogTitle>
              <DialogDescription>
                Configure seu QR Code para captação de leads
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do QR Code</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Stand Principal - Feira Tech"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva onde e como este QR Code será usado"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="campaign">Campanha (opcional)</Label>
                <Input
                  id="campaign"
                  value={formData.campaign}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
                  placeholder="Ex: Feira Tech 2024"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQRCode} disabled={!formData.name.trim()}>
                Criar QR Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeQRCodes} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Capturados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Via QR Codes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qrCodes.length > 0 ? Math.round((totalLeads / qrCodes.length) * 100) / 100 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Leads por QR Code
            </p>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes List */}
      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum QR Code criado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro QR Code para começar a capturar leads automaticamente
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <QrCode className="w-4 h-4 mr-2" />
              Criar Primeiro QR Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                    {qrCode.description && (
                      <p className="text-sm text-muted-foreground">
                        {qrCode.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={qrCode.isActive ? 'default' : 'secondary'}>
                      {qrCode.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* QR Code Preview */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border">
                    <img 
                      src={qrCode.qrCodeUrl} 
                      alt={`QR Code - ${qrCode.name}`}
                      className="w-32 h-32"
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{qrCode.leadCount}</div>
                    <div className="text-xs text-muted-foreground">Leads Capturados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {new Date(qrCode.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">Data de Criação</div>
                  </div>
                </div>
                
                {qrCode.campaign && (
                  <div className="text-center">
                    <Badge variant="outline">{qrCode.campaign}</Badge>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyUrl(qrCode.targetUrl)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar URL
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadQRCode(qrCode)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedQRCode(qrCode);
                      setIsPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  
                  <Button 
                    variant={qrCode.isActive ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => toggleQRCodeStatus(qrCode.id)}
                  >
                    {qrCode.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visualizar QR Code</DialogTitle>
            <DialogDescription>
              {selectedQRCode?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQRCode && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-6 bg-white rounded-lg border">
                  <img 
                    src={selectedQRCode.qrCodeUrl} 
                    alt={`QR Code - ${selectedQRCode.name}`}
                    className="w-64 h-64"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label>URL de Destino:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={selectedQRCode.targetUrl} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyUrl(selectedQRCode.targetUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedQRCode.description && (
                  <div>
                    <Label>Descrição:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedQRCode.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label>Status:</Label>
                    <div className="mt-1">
                      <Badge variant={selectedQRCode.isActive ? 'default' : 'secondary'}>
                        {selectedQRCode.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Leads Capturados:</Label>
                    <div className="text-lg font-semibold mt-1">
                      {selectedQRCode.leadCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedQRCode && (
              <Button onClick={() => handleDownloadQRCode(selectedQRCode)}>
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Alert */}
      <Alert>
        <QrCode className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Cada QR Code gera uma URL única que direciona para um formulário de captação de leads. 
          Os leads capturados são automaticamente marcados com a fonte "qr_code" para fácil identificação.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QRCodeLeadCapture;