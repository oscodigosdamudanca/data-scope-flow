import React from 'react';
import { QuestionTypesManager } from '@/features/admin/components/QuestionTypesManager';
import { BackToDashboard } from '@/components/core';
import MainLayout from '@/components/layout/MainLayout';

export const QuestionTypesPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tipos de Perguntas</h1>
            <p className="text-muted-foreground">
              Configure e gerencie os tipos de perguntas disponíveis no sistema.
            </p>
          </div>
        </div>
        
        <QuestionTypesManager />
      </div>
    </MainLayout>
  );
};

export default QuestionTypesPage;