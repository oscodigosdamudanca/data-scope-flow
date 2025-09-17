import React from 'react';
import { LeadForm } from './LeadForm';
import { Button } from '@/components/ui/button';

const LeadFormTest: React.FC = () => {
  const [showForm, setShowForm] = React.useState(true);
  
  const handleSuccess = () => {
    console.log('Lead salvo com sucesso!');
  };
  
  const handleCancel = () => {
    setShowForm(false);
  };
  
  if (!showForm) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Teste do Formulário de Leads</h2>
        <Button onClick={() => setShowForm(true)}>Mostrar Formulário</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Teste do Formulário de Leads</h2>
      <LeadForm 
        companyId="test-company-id"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LeadFormTest;