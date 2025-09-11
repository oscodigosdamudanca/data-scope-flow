import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCandidates } from '../hooks/useCandidates';
import { CandidateForm } from './CandidateForm';
import { CandidateDetails } from './CandidateDetails';
import type { Candidate, CandidateFilters, CandidateStatus } from '@/types/interviews';
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from '@/types/interviews';

export const CandidatesManager: React.FC = () => {
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

  const {
    candidates,
    isLoading,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateCandidateStatus,
    isCreating,
    isUpdating,
    isDeleting
  } = useCandidates(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status as CandidateStatus 
    }));
  };

  const handleCreateCandidate = (data: any) => {
    createCandidate(data);
    setIsFormOpen(false);
  };

  const handleUpdateCandidate = (data: any) => {
    if (candidateToEdit) {
      updateCandidate({ id: candidateToEdit.id, updates: data });
      setCandidateToEdit(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    if (window.confirm(`Tem certeza que deseja remover o candidato ${candidate.name}?`)) {
      deleteCandidate(candidate.id);
    }
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setIsFormOpen(true);
  };

  const handleStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
    updateCandidateStatus(candidateId, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600">Gerencie candidatos e processos seletivos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Candidato
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidatos */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum candidato encontrado</p>
              <Button onClick={() => setIsFormOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Candidato
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{candidate.name}</div>
                          {candidate.phone && (
                            <div className="text-sm text-gray-500">{candidate.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        <Select
                          value={candidate.status}
                          onValueChange={(value) => handleStatusChange(candidate.id, value as CandidateStatus)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-auto">
                            <Badge className={CANDIDATE_STATUS_COLORS[candidate.status]}>
                              {CANDIDATE_STATUS_LABELS[candidate.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(candidate.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(candidate)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCandidate(candidate)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCandidate(candidate)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
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

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {candidateToEdit ? 'Editar Candidato' : 'Novo Candidato'}
            </DialogTitle>
          </DialogHeader>
          <CandidateForm
            candidate={candidateToEdit}
            onSubmit={candidateToEdit ? handleUpdateCandidate : handleCreateCandidate}
            onCancel={() => {
              setIsFormOpen(false);
              setCandidateToEdit(null);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Candidato</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <CandidateDetails
              candidate={selectedCandidate}
              onEdit={() => {
                setIsDetailsOpen(false);
                handleEditCandidate(selectedCandidate);
              }}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};