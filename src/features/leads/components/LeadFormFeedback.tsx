import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface LeadFormFeedbackProps {
  mode: 'create' | 'edit';
  onNewLead: () => void;
  onBack?: () => void;
}

const LeadFormFeedback: React.FC<LeadFormFeedbackProps> = ({
  mode,
  onNewLead,
  onBack
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="rounded-full bg-green-100 p-3">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold">Lead {mode === 'edit' ? 'Atualizado' : 'Capturado'} com Sucesso!</h3>
      <p className="text-center text-gray-600">
        {mode === 'edit' 
          ? 'As informações do lead foram atualizadas com sucesso.' 
          : 'O lead foi capturado com sucesso e está pronto para ser gerenciado.'}
      </p>
      <div className="flex space-x-3 mt-4">
        <Button onClick={onNewLead}>
          Capturar Novo Lead
        </Button>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeadFormFeedback;