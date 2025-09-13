import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tag, 
  Search, 
  Filter,
  X,
  Plus,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Tag {
  id: string;
  name: string;
  color: string;
  category: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  tags: string[];
  createdAt: string;
}

interface LeadTaggingProps {
  companyId: string;
  onLeadsUpdate?: (leads: Lead[]) => void;
  className?: string;
}

const LeadTagging: React.FC<LeadTaggingProps> = ({
  companyId,
  onLeadsUpdate,
  className = ''
}) => {
  // Tags disponíveis (normalmente viriam de uma API)
  const availableTags: Tag[] = [
    { id: '1', name: 'Hot Lead', color: 'bg-red-500', category: 'Prioridade' },
    { id: '2', name: 'Qualificado', color: 'bg-green-500', category: 'Status' },
    { id: '3', name: 'Empresa Grande', color: 'bg-blue-500', category: 'Segmento' },
    { id: '4', name: 'Tecnologia', color: 'bg-purple-500', category: 'Setor' },
    { id: '5', name: 'Follow-up', color: 'bg-yellow-500', category: 'Ação' },
    { id: '6', name: 'Cold Lead', color: 'bg-gray-500', category: 'Prioridade' },
    { id: '7', name: 'Interessado', color: 'bg-orange-500', category: 'Status' },
    { id: '8', name: 'Startup', color: 'bg-pink-500', category: 'Segmento' }
  ];

  // Leads mockados
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Corp',
      status: 'Novo',
      tags: ['1', '4'],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@startup.com',
      company: 'Startup Inc',
      status: 'Qualificado',
      tags: ['2', '8'],
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@bigcorp.com',
      company: 'Big Corp',
      status: 'Interessado',
      tags: ['3', '7'],
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@tech.com',
      company: 'Tech Solutions',
      status: 'Novo',
      tags: ['4'],
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      name: 'Carlos Ferreira',
      email: 'carlos@empresa.com',
      company: 'Empresa XYZ',
      status: 'Follow-up',
      tags: ['5', '6'],
      createdAt: '2024-01-11'
    }
  ]);

  // Estados
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByTag, setFilterByTag] = useState<string>('');
  const [isTaggingDialogOpen, setIsTaggingDialogOpen] = useState(false);
  const [selectedTagsForAction, setSelectedTagsForAction] = useState<string[]>([]);
  const [taggingAction, setTaggingAction] = useState<'add' | 'remove'>('add');

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesTagFilter = !filterByTag || lead.tags.includes(filterByTag);
    
    return matchesSearch && matchesTagFilter;
  });

  // Funções de manipulação
  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleBulkTagging = () => {
    if (selectedLeads.length === 0 || selectedTagsForAction.length === 0) return;

    const updatedLeads = leads.map(lead => {
      if (selectedLeads.includes(lead.id)) {
        let newTags = [...lead.tags];
        
        if (taggingAction === 'add') {
          // Adicionar tags (evitar duplicatas)
          selectedTagsForAction.forEach(tagId => {
            if (!newTags.includes(tagId)) {
              newTags.push(tagId);
            }
          });
        } else {
          // Remover tags
          newTags = newTags.filter(tagId => !selectedTagsForAction.includes(tagId));
        }
        
        return { ...lead, tags: newTags };
      }
      return lead;
    });

    setLeads(updatedLeads);
    onLeadsUpdate?.(updatedLeads);
    
    // Reset
    setSelectedLeads([]);
    setSelectedTagsForAction([]);
    setIsTaggingDialogOpen(false);
  };

  const handleToggleTag = (leadId: string, tagId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const newTags = lead.tags.includes(tagId)
          ? lead.tags.filter(id => id !== tagId)
          : [...lead.tags, tagId];
        return { ...lead, tags: newTags };
      }
      return lead;
    });

    setLeads(updatedLeads);
    onLeadsUpdate?.(updatedLeads);
  };

  // Obter tag por ID
  const getTagById = (tagId: string) => availableTags.find(tag => tag.id === tagId);

  // Cores para texto baseado na cor de fundo
  const getTextColor = (bgColor: string) => {
    return bgColor.includes('yellow') ? 'text-black' : 'text-white';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciar Tags dos Leads
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedLeads.length > 0 && (
              <>
                <Badge variant="secondary">
                  {selectedLeads.length} selecionado(s)
                </Badge>
                <Dialog open={isTaggingDialogOpen} onOpenChange={setIsTaggingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Aplicar Tags
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aplicar Tags em Lote</DialogTitle>
                      <DialogDescription>
                        Aplicar ou remover tags de {selectedLeads.length} lead(s) selecionado(s).
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ação</label>
                        <Select value={taggingAction} onValueChange={(value: 'add' | 'remove') => setTaggingAction(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">Adicionar Tags</SelectItem>
                            <SelectItem value="remove">Remover Tags</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {availableTags.map(tag => (
                            <div key={tag.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`bulk-tag-${tag.id}`}
                                checked={selectedTagsForAction.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTagsForAction(prev => [...prev, tag.id]);
                                  } else {
                                    setSelectedTagsForAction(prev => prev.filter(id => id !== tag.id));
                                  }
                                }}
                              />
                              <label htmlFor={`bulk-tag-${tag.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Badge className={`${tag.color} ${getTextColor(tag.color)} text-xs`}>
                                  {tag.name}
                                </Badge>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTaggingDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleBulkTagging}
                        disabled={selectedTagsForAction.length === 0}
                      >
                        {taggingAction === 'add' ? 'Adicionar' : 'Remover'} Tags
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <Select value={filterByTag} onValueChange={setFilterByTag}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as tags</SelectItem>
                {availableTags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Controles de Seleção */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({filteredLeads.length} leads)
            </span>
          </div>
          {selectedLeads.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeads([])}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Seleção
            </Button>
          )}
        </div>

        {/* Lista de Leads */}
        <div className="space-y-3">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <Card key={lead.id} className={`p-4 transition-all ${
                selectedLeads.includes(lead.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
              }`}>
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-3">
                    {/* Informações do Lead */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        {lead.company && (
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                      <Badge variant="outline">{lead.status}</Badge>
                    </div>

                    {/* Tags Atuais */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        Tags atuais:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lead.tags.length > 0 ? (
                          lead.tags.map(tagId => {
                            const tag = getTagById(tagId);
                            if (!tag) return null;
                            
                            return (
                              <Badge 
                                key={tagId}
                                className={`${tag.color} ${getTextColor(tag.color)} cursor-pointer hover:opacity-80`}
                                onClick={() => handleToggleTag(lead.id, tagId)}
                              >
                                {tag.name}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Nenhuma tag aplicada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags Disponíveis para Adicionar */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Plus className="h-3 w-3" />
                        Adicionar tags:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(tag => !lead.tags.includes(tag.id))
                          .slice(0, 6)
                          .map(tag => (
                            <Badge 
                              key={tag.id}
                              variant="outline"
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleToggleTag(lead.id, tag.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))
                        }
                        {availableTags.filter(tag => !lead.tags.includes(tag.id)).length > 6 && (
                          <Badge variant="outline" className="text-muted-foreground">
                            +{availableTags.filter(tag => !lead.tags.includes(tag.id)).length - 6} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum lead encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterByTag 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há leads para exibir'
                }
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {filteredLeads.length > 0 && (
          <Card className="mt-6 bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{filteredLeads.length}</div>
                  <div className="text-xs text-muted-foreground">Leads Exibidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredLeads.filter(lead => lead.tags.length > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Com Tags</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedLeads.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Selecionados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(filteredLeads.reduce((sum, lead) => sum + lead.tags.length, 0) / Math.max(filteredLeads.length, 1))}
                  </div>
                  <div className="text-xs text-muted-foreground">Tags/Lead (Média)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadTagging;