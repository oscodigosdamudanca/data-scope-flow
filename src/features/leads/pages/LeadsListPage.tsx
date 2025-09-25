import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import LeadsList from '../components/LeadsList';
import LeadModal from '../components/LeadModal';
import { useCompany } from '@/contexts/CompanyContext';
import type { Lead } from '@/types/leads';

const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleLeadEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleLeadSave = (updatedLead: Lead) => {
    // O modal já atualiza o lead através do hook useLeads
    // Aqui podemos adicionar lógica adicional se necessário
    console.log('Lead atualizado:', updatedLead);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/leads')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gerenciar Leads
              </h1>
              <p className="text-gray-600">
                Visualize, filtre e gerencie todos os seus leads
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/leads/capture')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Lista de Leads */}
        <LeadsList 
          companyId={currentCompany?.id}
          onLeadSelect={handleLeadSelect}
          onLeadEdit={handleLeadEdit}
          className="mb-8"
        />

        {/* Modal de Lead */}
        <LeadModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          onSave={handleLeadSave}
        />
      </div>
    </MainLayout>
  );
};

export default LeadsListPage;