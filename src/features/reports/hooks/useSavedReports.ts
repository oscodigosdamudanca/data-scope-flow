import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedReport {
  id: string;
  name: string;
  company_id: string;
  user_id: string;
  report_type: 'leads' | 'surveys' | 'analytics' | 'custom';
  config: Record<string, any>;
  filters: Record<string, any>;
  data?: Record<string, any>;
  is_public: boolean;
  is_favorite: boolean;
  tags: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
}

export interface CreateSavedReportData {
  name: string;
  report_type: 'leads' | 'surveys' | 'analytics' | 'custom';
  config: Record<string, any>;
  filters: Record<string, any>;
  data?: Record<string, any>;
  is_public?: boolean;
  is_favorite?: boolean;
  tags?: string[];
  description?: string;
}

export interface UpdateSavedReportData {
  name?: string;
  config?: Record<string, any>;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  is_public?: boolean;
  is_favorite?: boolean;
  tags?: string[];
  description?: string;
}

// Implementação temporária usando localStorage até a tabela saved_reports ser criada
const STORAGE_KEY = 'datascope_saved_reports';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getStoredReports(): SavedReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredReports(reports: SavedReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function useSavedReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar relatórios salvos
  const {
    data: savedReports = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['saved-reports', user?.id],
    queryFn: async (): Promise<SavedReport[]> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const reports = getStoredReports();
      return reports.filter(report => report.user_id === user.id);
    },
    enabled: !!user?.id,
  });

  // Criar novo relatório
  const createReport = useMutation({
    mutationFn: async (reportData: CreateSavedReportData): Promise<SavedReport> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const newReport: SavedReport = {
        id: generateId(),
        ...reportData,
        user_id: user.id,
        company_id: user.user_metadata?.company_id || '',
        is_public: reportData.is_public || false,
        is_favorite: reportData.is_favorite || false,
        tags: reportData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };

      const reports = getStoredReports();
      reports.push(newReport);
      setStoredReports(reports);

      return newReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });

  // Atualizar relatório
  const updateReport = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateSavedReportData & { id: string }): Promise<SavedReport> => {
      const reports = getStoredReports();
      const reportIndex = reports.findIndex(r => r.id === id);
      
      if (reportIndex === -1) {
        throw new Error('Relatório não encontrado');
      }

      const updatedReport = {
        ...reports[reportIndex],
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      reports[reportIndex] = updatedReport;
      setStoredReports(reports);

      return updatedReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });

  // Deletar relatório
  const deleteReport = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const reports = getStoredReports();
      const filteredReports = reports.filter(r => r.id !== id);
      setStoredReports(filteredReports);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });

  // Atualizar último acesso
  const updateLastAccess = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const reports = getStoredReports();
      const reportIndex = reports.findIndex(r => r.id === id);
      
      if (reportIndex !== -1) {
        reports[reportIndex].last_accessed_at = new Date().toISOString();
        setStoredReports(reports);
      }
    },
  });

  return {
    savedReports,
    isLoading,
    error,
    refetch,
    createReport: createReport.mutate,
    updateReport: updateReport.mutate,
    deleteReport: deleteReport.mutate,
    updateLastAccess: updateLastAccess.mutate,
    isCreating: createReport.isPending,
    isUpdating: updateReport.isPending,
    isDeleting: deleteReport.isPending,
  };
}

// Hook para migrar dados do localStorage para o banco
export function useMigrateReportsFromLocalStorage() {
  const { createReport } = useSavedReports();
  const { user } = useAuth();

  const migrateReports = async () => {
    if (!user?.id) return;

    try {
      // Buscar relatórios salvos no localStorage antigo
      const savedReportsJson = localStorage.getItem('savedReports');
      if (!savedReportsJson) return;

      const localReports = JSON.parse(savedReportsJson);
      
      // Migrar cada relatório para o novo formato
      for (const report of localReports) {
        await createReport({
          name: report.name,
          report_type: report.type || 'custom',
          config: report.config || {},
          filters: report.filters || {},
          data: report.data || {},
          description: report.description,
          tags: report.tags || [],
        });
      }

      // Limpar localStorage antigo após migração bem-sucedida
      localStorage.removeItem('savedReports');
      
      console.log('Relatórios migrados com sucesso do localStorage antigo para o novo formato');
    } catch (error) {
      console.error('Erro ao migrar relatórios:', error);
    }
  };

  return { migrateReports };
}

// Função auxiliar para buscar relatórios por tipo
export function useSavedReportsByType(reportType: SavedReport['report_type']) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-reports', user?.id, reportType],
    queryFn: async (): Promise<SavedReport[]> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const reports = getStoredReports();
      return reports.filter(report => 
        report.user_id === user.id && report.report_type === reportType
      );
    },
    enabled: !!user?.id,
  });
}