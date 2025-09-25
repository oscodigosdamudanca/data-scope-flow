import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { logError } from '@/utils/logger';

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
        .eq('company_memberships.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Erro ao buscar empresas', error, 'CompanyContext');
        throw error;
      }

      return data as Company[];
    },
    enabled: !!user,
  });

  // Efeito para definir empresa padrão quando as empresas são carregadas
  useEffect(() => {
    if (companiesQuery.data && companiesQuery.data.length > 0 && !currentCompany) {
      // Buscar empresa padrão do usuário no banco de dados
      const getUserDefaultCompany = async () => {
        if (!user) return;
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('default_company_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.default_company_id) {
            const savedCompany = companiesQuery.data.find(c => c.id === profile.default_company_id);
            if (savedCompany) {
              setCurrentCompanyState(savedCompany);
              return;
            }
          }
        } catch (error) {
          console.log('Erro ao buscar empresa padrão:', error);
        }
        
        // Se não há empresa salva no perfil, usar a primeira empresa (preferencialmente onde é admin)
        const adminCompany = companiesQuery.data.find(c => 
          c.company_memberships[0]?.role === 'admin'
        );
        
        setCurrentCompanyState(adminCompany || companiesQuery.data[0]);
      };
      
      getUserDefaultCompany();
    }
  }, [companiesQuery.data, currentCompany, user]);

  const setCurrentCompany = async (company: Company | null) => {
    setCurrentCompanyState(company);
    
    if (company && user) {
      // Salvar empresa padrão no perfil do usuário
      try {
        await supabase
          .from('profiles')
          .update({ default_company_id: company.id })
          .eq('id', user.id);
        
        toast.success(`Empresa alterada para: ${company.name}`);
      } catch (error) {
        console.error('Erro ao salvar empresa padrão:', error);
        toast.error('Erro ao salvar preferência de empresa');
      }
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