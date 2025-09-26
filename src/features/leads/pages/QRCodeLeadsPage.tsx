import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import QRCodeLeadCapture from '../components/QRCodeLeadCapture';
import { useAuth } from '@/contexts/AuthContext';

const QRCodeLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <BackToDashboard />
        
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
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              QR Codes para Captação de Leads
            </h1>
            <p className="text-gray-600">
              Crie e gerencie QR Codes para capturar leads automaticamente em eventos, stands e pontos de contato
            </p>
          </div>
        </div>

        <QRCodeLeadCapture />
      </div>
    </MainLayout>
  );
};

export default QRCodeLeadsPage;