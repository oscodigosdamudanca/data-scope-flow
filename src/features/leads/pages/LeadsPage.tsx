import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O sistema de leads está sendo desenvolvido. Em breve você poderá gerenciar todos os leads capturados durante a feira.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LeadsPage;