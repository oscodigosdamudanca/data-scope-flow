import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreateLeadForm } from '../components/CreateLeadForm';
import { useAuth } from '@/contexts/AuthContext';

const CreateLeadPage: React.FC = () => {
  const { userRole } = useAuth();
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={userRole === 'interviewer' ? '/leads/capture' : '/leads'}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Lead</h1>
            <p className="text-muted-foreground">
              Adicione um novo lead ao seu sistema de gestão
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <CreateLeadForm />
    </div>
  );
};

export default CreateLeadPage;