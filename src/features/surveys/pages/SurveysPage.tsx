import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { SurveyManager } from '../components';

const SurveysPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pesquisas e Formulários</h1>
            <p className="text-muted-foreground">
              Gerencie pesquisas, formulários e colete feedback dos visitantes.
            </p>
          </div>
        </div>
        
        <SurveyManager />
      </div>
    </MainLayout>
  );
};

export default SurveysPage;