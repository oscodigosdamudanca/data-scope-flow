import React, { useState } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import CompanyList from '@/features/companies/components/CompanyList';
import CompanyForm from '@/features/companies/components/CompanyForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

const Companies = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingCompany, setEditingCompany] = useState<any>(null);

  const handleCreateNew = () => {
    setEditingCompany(null);
    setViewMode('create');
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setViewMode('edit');
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingCompany(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingCompany(null);
  };

  return (
    <MainLayout>
        <div className="space-y-6">
          {viewMode !== 'list' && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          )}

          {viewMode === 'list' && (
            <CompanyList
              onCreateNew={handleCreateNew}
              onEditCompany={handleEditCompany}
            />
          )}

          {(viewMode === 'create' || viewMode === 'edit') && (
            <CompanyForm
              company={editingCompany}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </MainLayout>
  );
};

export default Companies;