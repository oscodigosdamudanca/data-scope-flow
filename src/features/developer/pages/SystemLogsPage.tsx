import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SystemLogsPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/developer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Logs do Sistema</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registros de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p>Visualização de logs do sistema será implementada em breve.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SystemLogsPage;