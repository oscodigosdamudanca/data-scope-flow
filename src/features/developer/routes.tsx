import React from 'react';
import { Route } from 'react-router-dom';
import DeveloperDashboard from './pages/DeveloperDashboard';
import QuestionTypesPage from './pages/QuestionTypesPage';
import PermissionsPage from './pages/PermissionsPage';
// Componente temporário enquanto o SystemLogsPage é finalizado
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

const SystemLogsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Logs do Sistema</h1>
        <Card>
          <CardContent className="p-6">
            <p>Visualização de logs do sistema será implementada em breve.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export const developerRoutes = (
  <Route path="developer">
    <Route index element={<DeveloperDashboard />} />
    <Route path="question-types" element={<QuestionTypesPage />} />
    <Route path="permissions" element={<PermissionsPage />} />
    <Route path="logs" element={<SystemLogsPage />} />
  </Route>
);