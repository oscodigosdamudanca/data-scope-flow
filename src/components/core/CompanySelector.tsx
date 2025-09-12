import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompany } from '@/contexts/CompanyContext';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const CompanySelector: React.FC = () => {
  const { currentCompany, companies, isLoading, setCurrentCompany } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Nenhuma empresa encontrada</span>
      </div>
    );
  }

  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{companies[0].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <Select
        value={currentCompany?.id || ''}
        onValueChange={(value) => {
          const company = companies.find(c => c.id === value);
          setCurrentCompany(company || null);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex flex-col">
                <span className="font-medium">{company.name}</span>
                {company.legal_name && company.legal_name !== company.name && (
                  <span className="text-xs text-muted-foreground">
                    {company.legal_name}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};