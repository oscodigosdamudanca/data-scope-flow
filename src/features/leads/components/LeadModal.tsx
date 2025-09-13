import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  Edit, 
  Save, 
  X,
  History,
  Tag,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '../hooks/useLeads';
import type { Lead } from '@/types/leads';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  onSave?: (lead: Lead) => void;
}

interface LeadHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  action: 'created' | 'updated' | 'status_changed' | 'note_added';
}

interface LeadNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  type: 'note' | 'call' | 'email' | 'meeting';
}

const LeadModal: React.FC<LeadModalProps> = ({ 
  lead, 
  isOpen, 
  onClose, 
  mode: initialMode, 
  onSave 
}) => {
  const { toast } = useToast();
  const { updateLead } = useLeads();
  
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Mock data para histórico e notas
  const [history] = useState<LeadHistory[]>([
    {
      id: '1',
      field: 'status',
      oldValue: 'new',
      newValue: 'contacted',
      changedBy: 'João Silva',
      changedAt: '2024-01-15T10:30:00Z',
      action: 'status_changed'
    },
    {
      id: '2',
      field: 'phone',
      oldValue: '',
      newValue: '(11) 99999-9999',
      changedBy: 'Maria Santos',
      changedAt: '2024-01-14T15:45:00Z',
      action: 'updated'
    },
    {
      id: '3',
      field: 'created',
      oldValue: '',
      newValue: 'Lead criado',
      changedBy: 'Sistema',
      changedAt: '2024-01-14T09:00:00Z',
      action: 'created'
    }
  ]);
  
  const [notes] = useState<LeadNote[]>([
    {
      id: '1',
      content: 'Cliente demonstrou interesse no produto premium. Agendar demonstração.',
      createdBy: 'João Silva',
      createdAt: '2024-01-15T10:30:00Z',
      type: 'note'
    },
    {
      id: '2',
      content: 'Ligação realizada - cliente não atendeu. Tentar novamente amanhã.',
      createdBy: 'Maria Santos',
      createdAt: '2024-01-14T16:00:00Z',
      type: 'call'
    },
    {
      id: '3',
      content: 'Email de boas-vindas enviado automaticamente.',
      createdBy: 'Sistema',
      createdAt: '2024-01-14T09:05:00Z',
      type: 'email'
    }
  ]);
  
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<LeadNote['type']>('note');

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
    setMode(initialMode);
  }, [lead, initialMode]);

  const handleInputChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!lead || !formData) return;
    
    setLoading(true);
    try {
      const updatedLead = { ...lead, ...formData } as Lead;
      await updateLead(updatedLead);
      
      toast({
        title: 'Sucesso',
        description: 'Lead atualizado com sucesso!'
      });
      
      onSave?.(updatedLead);
      setMode('view');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // Mock - em produção, isso seria uma chamada à API
    toast({
      title: 'Nota adicionada',
      description: 'A nota foi adicionada ao histórico do lead'
    });
    
    setNewNote('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'new': 'default',
      'contacted': 'secondary', 
      'qualified': 'default',
      'converted': 'default',
      'lost': 'destructive'
    };

    const labels: Record<string, string> = {
      'new': 'Novo',
      'contacted': 'Contatado',
      'qualified': 'Qualificado', 
      'converted': 'Convertido',
      'lost': 'Perdido'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getActionIcon = (action: LeadHistory['action']) => {
    switch (action) {
      case 'created':
        return <User className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'status_changed':
        return <Tag className="w-4 h-4" />;
      case 'note_added':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getNoteIcon = (type: LeadNote['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {mode === 'edit' ? 'Editar Lead' : 'Detalhes do Lead'}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(formData.status || lead.status)}
              
              {mode === 'view' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMode('edit')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Nome completo"
                        />
                      ) : (
                        <p className="mt-1 font-medium">{lead.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      ) : (
                        <p className="mt-1">{lead.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="mt-1">{lead.phone || 'Não informado'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Profissionais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Informações Profissionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="company"
                          value={formData.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Nome da empresa"
                        />
                      ) : (
                        <p className="mt-1">{lead.company || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="position">Cargo</Label>
                      {mode === 'edit' ? (
                        <Input
                          id="position"
                          value={formData.position || ''}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Cargo/Função"
                        />
                      ) : (
                        <p className="mt-1">{lead.position || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      {mode === 'edit' ? (
                        <Select 
                          value={formData.status || lead.status} 
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Novo</SelectItem>
                            <SelectItem value="contacted">Contatado</SelectItem>
                            <SelectItem value="qualified">Qualificado</SelectItem>
                            <SelectItem value="converted">Convertido</SelectItem>
                            <SelectItem value="lost">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          {getStatusBadge(lead.status)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Adicionais */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Informações Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fonte</Label>
                        <p className="mt-1 capitalize">{lead.source || 'Não informado'}</p>
                      </div>
                      
                      <div>
                        <Label>Data de Criação</Label>
                        <p className="mt-1">{formatDate(lead.created_at)}</p>
                      </div>
                    </div>
                    
                    {lead.interests && lead.interests.length > 0 && (
                      <div>
                        <Label>Interesses</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {lead.interests.map((interest, index) => (
                            <Badge key={index} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mode === 'edit' && (
                      <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes || ''}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Observações sobre o lead..."
                          rows={3}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Histórico de Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {getActionIcon(item.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{item.changedBy}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(item.changedAt)}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              {item.action === 'created' && (
                                <span>Lead criado no sistema</span>
                              )}
                              {item.action === 'updated' && (
                                <span>
                                  Alterou <strong>{item.field}</strong> de 
                                  <span className="mx-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                    {item.oldValue || 'vazio'}
                                  </span>
                                  para
                                  <span className="mx-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {item.newValue}
                                  </span>
                                </span>
                              )}
                              {item.action === 'status_changed' && (
                                <span>
                                  Status alterado de 
                                  <span className="mx-1">{getStatusBadge(item.oldValue)}</span>
                                  para
                                  <span className="mx-1">{getStatusBadge(item.newValue)}</span>
                                </span>
                              )}
                              {item.action === 'note_added' && (
                                <span>Adicionou uma nota</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {index < history.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {/* Adicionar nova nota */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Nota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <Label>Tipo</Label>
                      <Select value={noteType} onValueChange={(value: LeadNote['type']) => setNoteType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">Nota</SelectItem>
                          <SelectItem value="call">Ligação</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-3">
                      <Label>Conteúdo</Label>
                      <div className="flex gap-2">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Digite sua nota..."
                          rows={2}
                        />
                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de notas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Notas e Interações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note, index) => (
                      <div key={note.id}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {getNoteIcon(note.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{note.createdBy}</span>
                              <Badge variant="outline" className="text-xs">
                                {note.type === 'note' && 'Nota'}
                                {note.type === 'call' && 'Ligação'}
                                {note.type === 'email' && 'Email'}
                                {note.type === 'meeting' && 'Reunião'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {note.content}
                            </p>
                          </div>
                        </div>
                        
                        {index < notes.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <div className="flex gap-2">
            {mode === 'edit' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFormData(lead);
                    setMode('view');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;