import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { LeadsManager } from '../components';

const LeadsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Captação de Leads</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todos os leads capturados durante a feira.
            </p>
          </div>
        </div>
        
        <LeadsManager />
      </div>
    </MainLayout>
  );
};

export default LeadsPage;