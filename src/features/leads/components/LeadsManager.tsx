import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { CreateLeadData, UpdateLeadData, LeadFilters } from '@/types/leads';
import { toast } from 'sonner';

const LeadsManager: React.FC = () => {
  const { leads, loading, createLead, updateLead, deleteLead, leadStats } = useLeads();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [createForm, setCreateForm] = useState<CreateLeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interest_level: 'medium',
    source: 'website',
    notes: ''
  });

  const [editForm, setEditForm] = useState<UpdateLeadData>({});

  const handleCreateLead = async () => {
    try {
      await createLead(createForm);
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        interest_level: 'medium',
        source: 'website',
        notes: ''
      });
      toast.success('Lead criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar lead');
    }
  };

  const handleEditLead = async () => {
    if (!selectedLead) return;
    
    try {
      await updateLead(selectedLead.id, editForm);
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      setEditForm({});
      toast.success('Lead atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este lead?')) {
      try {
        await deleteLead(leadId);
        toast.success('Lead deletado com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar lead');
      }
    }
  };

  const openEditDialog = (lead: any) => {
    setSelectedLead(lead);
    setEditForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      interest_level: lead.interest_level,
      source: lead.source,
      notes: lead.notes,
      status: lead.status
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSource = !filters.source || lead.source === filters.source;
    const matchesInterest = !filters.interest_level || lead.interest_level === filters.interest_level;
    
    return matchesSearch && matchesStatus && matchesSource && matchesInterest;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{leadStats?.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total de Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{leadStats?.new || 0}</div>
            <div className="text-sm text-muted-foreground">Novos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{leadStats?.qualified || 0}</div>
            <div className="text-sm text-muted-foreground">Qualificados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{leadStats?.converted || 0}</div>
            <div className="text-sm text-muted-foreground">Convertidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Leads</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Lead</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={createForm.company}
                      onChange={(e) => setCreateForm({...createForm, company: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={createForm.position}
                      onChange={(e) => setCreateForm({...createForm, position: e.target.value})}
                      placeholder="Cargo na empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_level">Nível de Interesse</Label>
                    <Select value={createForm.interest_level} onValueChange={(value) => setCreateForm({...createForm, interest_level: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">Origem</Label>
                    <Select value={createForm.source} onValueChange={(value) => setCreateForm({...createForm, source: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="social_media">Redes Sociais</SelectItem>
                        <SelectItem value="referral">Indicação</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="cold_outreach">Prospecção</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={createForm.notes}
                      onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                      placeholder="Observações sobre o lead..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateLead} disabled={!createForm.name || !createForm.email}>
                    Criar Lead
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || ''} onValueChange={(value) => setFilters({...filters, status: value || undefined})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="contacted">Contatado</SelectItem>
                <SelectItem value="qualified">Qualificado</SelectItem>
                <SelectItem value="converted">Convertido</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.source || ''} onValueChange={(value) => setFilters({...filters, source: value || undefined})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Redes Sociais</SelectItem>
                <SelectItem value="referral">Indicação</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="cold_outreach">Prospecção</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Nome</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Empresa</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Interesse</th>
                    <th className="text-left p-4 font-medium">Origem</th>
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-muted-foreground">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-t hover:bg-muted/25">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            {lead.position && <div className="text-sm text-muted-foreground">{lead.position}</div>}
                          </div>
                        </td>
                        <td className="p-4">{lead.email}</td>
                        <td className="p-4">{lead.company || '-'}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status === 'new' && 'Novo'}
                            {lead.status === 'contacted' && 'Contatado'}
                            {lead.status === 'qualified' && 'Qualificado'}
                            {lead.status === 'converted' && 'Convertido'}
                            {lead.status === 'lost' && 'Perdido'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getInterestColor(lead.interest_level)}>
                            {lead.interest_level === 'high' && 'Alto'}
                            {lead.interest_level === 'medium' && 'Médio'}
                            {lead.interest_level === 'low' && 'Baixo'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {lead.source === 'website' && 'Website'}
                          {lead.source === 'social_media' && 'Redes Sociais'}
                          {lead.source === 'referral' && 'Indicação'}
                          {lead.source === 'event' && 'Evento'}
                          {lead.source === 'cold_outreach' && 'Prospecção'}
                          {lead.source === 'other' && 'Outro'}
                        </td>
                        <td className="p-4">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(lead)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-company">Empresa</Label>
              <Input
                id="edit-company"
                value={editForm.company || ''}
                onChange={(e) => setEditForm({...editForm, company: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-position">Cargo</Label>
              <Input
                id="edit-position"
                value={editForm.position || ''}
                onChange={(e) => setEditForm({...editForm, position: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editForm.status || ''} onValueChange={(value) => setEditForm({...editForm, status: value as any})}>
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
            </div>
            <div>
              <Label htmlFor="edit-interest">Nível de Interesse</Label>
              <Select value={editForm.interest_level || ''} onValueChange={(value) => setEditForm({...editForm, interest_level: value as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-source">Origem</Label>
              <Select value={editForm.source || ''} onValueChange={(value) => setEditForm({...editForm, source: value as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social_media">Redes Sociais</SelectItem>
                  <SelectItem value="referral">Indicação</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="cold_outreach">Prospecção</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditLead}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManager;