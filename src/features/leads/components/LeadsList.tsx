import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLeads } from '../hooks/useLeads';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadFilters } from '@/types/leads';
import { LeadExport } from './LeadExport';
import LeadEditModal from './LeadEditModal';

interface LeadsListProps {
  companyId?: string;
  onLeadSelect?: (lead: Lead) => void;
  onLeadEdit?: (lead: Lead) => void;
  className?: string;
}

type SortField = 'name' | 'email' | 'status' | 'created_at' | 'company';
type SortDirection = 'asc' | 'desc';

interface LeadsListState {
  currentPage: number;
  itemsPerPage: number;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedLeads: string[];
  filters: LeadFilters;
  searchTerm: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const LeadsList: React.FC<LeadsListProps> = ({ 
  companyId, 
  onLeadSelect, 
  onLeadEdit,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, loading, error, fetchLeads, deleteLead } = useLeads(companyId);
  
  const [state, setState] = useState<LeadsListState>({
    currentPage: 1,
    itemsPerPage: 25,
    sortField: 'created_at',
    sortDirection: 'desc',
    selectedLeads: [],
    filters: {},
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Aplicar filtros e ordenação
  const filteredAndSortedLeads = React.useMemo(() => {
    let filtered = [...leads];

    // Aplicar busca textual
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        (lead.company && lead.company.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtros
    if (state.filters.status) {
      filtered = filtered.filter(lead => lead.status === state.filters.status);
    }
    if (state.filters.source) {
      filtered = filtered.filter(lead => lead.source === state.filters.source);
    }
    if (state.filters.dateFrom) {
      filtered = filtered.filter(lead => new Date(lead.created_at) >= new Date(state.filters.dateFrom!));
    }
    if (state.filters.dateTo) {
      filtered = filtered.filter(lead => new Date(lead.created_at) <= new Date(state.filters.dateTo!));
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[state.sortField];
      let bValue: any = b[state.sortField];

      if (state.sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (state.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, state.searchTerm, state.filters, state.sortField, state.sortDirection]);

  // Paginação
  const totalItems = filteredAndSortedLeads.length;
  const totalPages = Math.ceil(totalItems / state.itemsPerPage);
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const currentPageLeads = filteredAndSortedLeads.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (field: SortField) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setState(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 
    }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setState(prev => ({ 
      ...prev, 
      searchTerm, 
      currentPage: 1 
    }));
  };

  const handleFilterChange = (filters: Partial<LeadFilters>) => {
    setState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, ...filters }, 
      currentPage: 1 
    }));
  };

  const handleSelectLead = (leadId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedLeads: selected 
        ? [...prev.selectedLeads, leadId]
        : prev.selectedLeads.filter(id => id !== leadId)
    }));
  };

  const handleSelectAll = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedLeads: selected ? currentPageLeads.map(lead => lead.id) : []
    }));
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await deleteLead(leadId);
        toast({
          title: 'Lead excluído',
          description: 'Lead foi excluído com sucesso'
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o lead',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleSaveLead = (updatedLead: Lead) => {
    // Mock update - replace with actual API call
    console.log('Saving lead:', updatedLead);
    setEditingLead(null);
    // Refresh leads list
    fetchLeads();
  };

  const handleBulkDelete = async () => {
    if (state.selectedLeads.length === 0) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${state.selectedLeads.length} lead(s)?`)) {
      try {
        await Promise.all(state.selectedLeads.map(id => deleteLead(id)));
        setState(prev => ({ ...prev, selectedLeads: [] }));
        toast({
          title: 'Leads excluídos',
          description: `${state.selectedLeads.length} lead(s) foram excluídos com sucesso`
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir os leads',
          variant: 'destructive'
        });
      }
    }
  };

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: 'Exportação iniciada',
      description: 'Os dados serão exportados em breve'
    });
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

  const getSortIcon = (field: SortField) => {
    if (state.sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return state.sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" /> 
      : <ArrowDown className="w-4 h-4" />;
  };

  useEffect(() => {
    fetchLeads(state.filters);
  }, [fetchLeads, state.filters]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar leads: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchLeads(state.filters)}
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Lista de Leads</h2>
          <p className="text-muted-foreground">
            {totalItems} lead(s) encontrado(s)
          </p>
        </div>
        
        <div className="flex gap-2">
          <LeadExport 
            leads={leads} 
            filteredLeads={filteredAndSortedLeads}
          />
          <Button 
             onClick={() => navigate('/leads/create')}
           >
             <Plus className="w-4 h-4 mr-2" />
             Novo Lead
           </Button>
          
          {state.selectedLeads.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir ({state.selectedLeads.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar ({state.selectedLeads.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={state.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Select 
                value={state.filters.status || ''} 
                onValueChange={(value) => handleFilterChange({ status: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={state.filters.source || ''} 
                onValueChange={(value) => handleFilterChange({ source: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fontes</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="qr_code">QR Code</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                placeholder="Data inicial"
                value={state.filters.dateFrom || ''}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
              />
              
              <Input
                type="date"
                placeholder="Data final"
                value={state.filters.dateTo || ''}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando leads...</p>
            </div>
          ) : currentPageLeads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/leads/capture')}
                className="mt-4"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar primeiro lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={state.selectedLeads.length === currentPageLeads.length && currentPageLeads.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Nome
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('company')}
                    >
                      <div className="flex items-center gap-2">
                        Empresa
                        {getSortIcon('company')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Data de Criação
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    
                    <TableHead className="w-12">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {currentPageLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={state.selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                        />
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>{lead.email}</TableCell>
                      
                      <TableCell>
                        <div>
                          {lead.company && <p className="font-medium">{lead.company}</p>}
                          {lead.position && (
                            <p className="text-sm text-muted-foreground">{lead.position}</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      
                      <TableCell>
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onLeadSelect?.(lead)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select 
                  value={state.itemsPerPage.toString()} 
                  onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
                </span>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(state.currentPage - 1)}
                    disabled={state.currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, state.currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={page === state.currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(state.currentPage + 1)}
                    disabled={state.currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal de edição */}
      {editingLead && (
        <LeadEditModal
          lead={editingLead}
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
};

export default LeadsList;