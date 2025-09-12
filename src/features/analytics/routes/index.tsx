import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AnalyticsPage from '../pages/AnalyticsPage';

/**
 * Rotas do módulo de Analytics
 * 
 * Estrutura de rotas:
 * - /analytics - Página principal do painel de BI
 * - /analytics/:tab - Página com aba específica (overview, leads, surveys, reports)
 * - /analytics/company/:companyId - Painel para empresa específica
 */
const AnalyticsRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rota principal - redireciona para overview */}
      <Route 
        path="/" 
        element={<Navigate to="/analytics/overview" replace />} 
      />
      
      {/* Rota com aba específica */}
      <Route 
        path="/:tab" 
        element={<AnalyticsPage />} 
      />
      
      {/* Rota para empresa específica */}
      <Route 
        path="/company/:companyId" 
        element={<AnalyticsPageWithCompany />} 
      />
      
      {/* Rota para empresa específica com aba */}
      <Route 
        path="/company/:companyId/:tab" 
        element={<AnalyticsPageWithCompany />} 
      />
      
      {/* Fallback - redireciona para overview */}
      <Route 
        path="*" 
        element={<Navigate to="/analytics/overview" replace />} 
      />
    </Routes>
  );
};

/**
 * Componente wrapper para páginas com companyId na URL
 */
const AnalyticsPageWithCompany: React.FC = () => {
  const { companyId, tab } = useParams<{ companyId: string; tab?: string }>();
  
  return (
    <AnalyticsPage 
      companyId={companyId} 
      defaultTab={tab || 'overview'} 
    />
  );
};



export default AnalyticsRoutes;

/**
 * Configuração de permissões para o módulo de Analytics
 * 
 * Permissões disponíveis:
 * - analytics:read - Visualizar dashboards e relatórios
 * - analytics:write - Criar e editar configurações de BI
 * - analytics:export - Exportar dados e relatórios
 * - analytics:admin - Administrar configurações avançadas
 */
export const analyticsPermissions = {
  READ: 'analytics:read',
  WRITE: 'analytics:write', 
  EXPORT: 'analytics:export',
  ADMIN: 'analytics:admin'
} as const;

/**
 * Configuração de navegação para o módulo de Analytics
 */
export const analyticsNavigation = {
  main: {
    path: '/analytics',
    label: 'Analytics',
    icon: 'BarChart3'
  },
  tabs: [
    {
      path: '/analytics/overview',
      label: 'Visão Geral',
      value: 'overview'
    },
    {
      path: '/analytics/leads', 
      label: 'Leads',
      value: 'leads'
    },
    {
      path: '/analytics/surveys',
      label: 'Pesquisas', 
      value: 'surveys'
    },
    {
      path: '/analytics/reports',
      label: 'Relatórios',
      value: 'reports'
    }
  ]
} as const;