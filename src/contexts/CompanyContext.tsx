import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  legal_name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: any;
  created_at: string;
  company_memberships: {
    role: 'admin' | 'interviewer';
    user_id: string;
  }[];
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  setCurrentCompany: (company: Company | null) => void;
  refreshCompanies: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);

  // Query para buscar empresas do usuário
  const companiesQuery = useQuery({
    queryKey: ['user-companies', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_memberships!inner(
            role,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar empresas:', error);
        throw error;
      }

      return data as Company[];
    },
    enabled: !!user,
  });

  // Efeito para definir empresa padrão quando as empresas são carregadas
  useEffect(() => {
    if (companiesQuery.data && companiesQuery.data.length > 0 && !currentCompany) {
      // Recuperar empresa salva no localStorage
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      
      if (savedCompanyId) {
        const savedCompany = companiesQuery.data.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setCurrentCompanyState(savedCompany);
          return;
        }
      }
      
      // Se não há empresa salva, usar a primeira empresa (preferencialmente onde é admin)
      const adminCompany = companiesQuery.data.find(c => 
        c.company_memberships[0]?.role === 'admin'
      );
      
      setCurrentCompanyState(adminCompany || companiesQuery.data[0]);
    }
  }, [companiesQuery.data, currentCompany]);

  const setCurrentCompany = (company: Company | null) => {
    setCurrentCompanyState(company);
    
    if (company) {
      localStorage.setItem('currentCompanyId', company.id);
      toast.success(`Empresa alterada para: ${company.name}`);
    } else {
      localStorage.removeItem('currentCompanyId');
    }
  };

  const refreshCompanies = () => {
    companiesQuery.refetch();
  };

  const value: CompanyContextType = {
    currentCompany,
    companies: companiesQuery.data || [],
    isLoading: companiesQuery.isLoading,
    setCurrentCompany,
    refreshCompanies,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export type { Company };