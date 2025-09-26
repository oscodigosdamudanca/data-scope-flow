import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Tag } from 'lucide-react';
import LeadTagging from '../components/LeadTagging';
import { useAuth } from '@/contexts/AuthContext';

const LeadTaggingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleLeadsUpdate = (updatedLeads: any[]) => {
    // Em produção, aqui faria a atualização no backend
    console.log('Leads atualizados:', updatedLeads);
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
              onClick={() => navigate(userRole === 'interviewer' ? '/leads/capture' : '/leads')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Leads
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="relative">
                  <Users className="w-8 h-8 text-indigo-600" />
                  <Tag className="w-4 h-4 text-orange-600 absolute -bottom-1 -right-1" />
                </div>
                Aplicar Tags aos Leads
              </h1>
              <p className="text-gray-600">
                Gerencie e aplique tags aos seus leads de forma individual ou em lote
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/leads/tags')}
                className="flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Gerenciar Tags
              </Button>
              <Button
                onClick={() => navigate('/leads/list')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Ver Todos os Leads
              </Button>
            </div>
          </div>
        </div>

        {/* Lead Tagging Component */}
        <LeadTagging 
          companyId="company-1" // Em produção, isso viria do contexto da empresa
          onLeadsUpdate={handleLeadsUpdate}
          className="mb-8"
        />
      </div>
    </MainLayout>
  );
};

export default LeadTaggingPage;