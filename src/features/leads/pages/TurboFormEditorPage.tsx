import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft } from 'lucide-react';
import TurboFormEditor, { FormQuestion } from '../components/TurboFormEditor';
import { useToast } from '@/hooks/use-toast';

// Perguntas de exemplo para demonstração
const sampleQuestions: FormQuestion[] = [
  {
    id: 'q1',
    question: 'Qual é o seu nome completo?',
    type: 'text',
    fieldName: 'fullName',
    required: true
  },
  {
    id: 'q2',
    question: 'Qual é o seu e-mail?',
    type: 'email',
    fieldName: 'email',
    required: true
  },
  {
    id: 'q3',
    question: 'Qual é o seu telefone?',
    type: 'tel',
    fieldName: 'phone',
    required: false
  },
  {
    id: 'q4',
    question: 'Como você conheceu nossa empresa?',
    type: 'radio',
    fieldName: 'referral',
    required: false,
    options: [
      { value: 'social', label: 'Redes Sociais' },
      { value: 'friend', label: 'Indicação de Amigo' },
      { value: 'search', label: 'Busca na Internet' },
      { value: 'event', label: 'Evento' }
    ]
  }
];

const TurboFormEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Simulação de verificação de permissão de administrador
  const isAdmin = true;

  const handleSave = (questions: FormQuestion[]) => {
    console.log('Perguntas salvas:', questions);
    // Aqui seria implementada a lógica para salvar as perguntas no banco de dados
    toast({
      title: 'Formulário atualizado',
      description: 'As perguntas do formulário Turbo foram atualizadas com sucesso.',
    });
    navigate('/leads');
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <Container>
      <PageHeader
        title="Editor do Formulário Turbo"
        description="Personalize as perguntas do formulário de captura rápida de leads"
        actions={
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />
      
      <div className="mt-6">
        <TurboFormEditor
          initialQuestions={sampleQuestions}
          onSave={handleSave}
          onCancel={handleCancel}
          isAdmin={isAdmin}
        />
      </div>
    </Container>
  );
};

export default TurboFormEditorPage;