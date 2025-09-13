import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCaptureForm } from '../components';
import MainLayout from '@/components/layout/MainLayout';

const LeadCapturePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (leadId: string) => {
    // Redirect to leads list after successful creation
    setTimeout(() => {
      navigate('/leads');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leads')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Leads
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Captação de Leads
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Capture novos leads de forma eficiente e organize suas oportunidades de negócio
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <LeadCaptureForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              title="Novo Lead"
              description="Preencha as informações do lead para iniciar o processo de qualificação"
            />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Por que capturar leads?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Organização Centralizada</p>
                      <p className="text-xs text-muted-foreground">
                        Mantenha todos os contatos em um só lugar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Qualificação Automática</p>
                      <p className="text-xs text-muted-foreground">
                        Identifique leads mais promissores
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Acompanhamento Eficaz</p>
                      <p className="text-xs text-muted-foreground">
                        Nunca perca uma oportunidade
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Leads Ativos</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                    <Badge variant="outline">0%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Leads Este Mês</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Dicas de Captação
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="font-medium text-blue-800">Seja Específico</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Quanto mais detalhes, melhor a qualificação
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="font-medium text-green-800">Acompanhe Rapidamente</p>
                    <p className="text-green-700 text-xs mt-1">
                      Contate leads novos em até 24 horas
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="font-medium text-purple-800">Use os Interesses</p>
                    <p className="text-purple-700 text-xs mt-1">
                      Personalize sua abordagem baseada nos interesses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LGPD Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-green-800">
                  🛡️ Conformidade LGPD
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Todos os dados são coletados com consentimento explícito e podem ser removidos a qualquer momento.
                </p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>✓ Consentimento explícito obrigatório</p>
                  <p>✓ Dados criptografados e seguros</p>
                  <p>✓ Direito ao esquecimento garantido</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeadCapturePage;