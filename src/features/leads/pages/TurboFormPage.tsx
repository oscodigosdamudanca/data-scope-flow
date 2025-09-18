import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TurboLeadForm from '../components/TurboLeadForm';
import { useToast } from '@/hooks/use-toast';

const TurboFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSuccess = (leadId: string) => {
    toast({
      title: "Lead cadastrado com sucesso!",
      description: "Os dados foram salvos no sistema.",
    });
    // Redirecionar para a lista de leads ou outra página relevante
    setTimeout(() => {
      navigate('/leads/list');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Formulário Rápido de Captação</CardTitle>
        </CardHeader>
        <CardContent>
          <TurboLeadForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TurboFormPage;