import React from 'react';
import { BackToDashboard } from '@/components/core';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Perguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O gerenciador de tipos de perguntas está sendo desenvolvido. Em breve você poderá configurar e gerenciar todos os tipos de perguntas do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default QuestionTypesPage;