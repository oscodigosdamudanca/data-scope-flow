import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/core';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CustomSurveys = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pesquisas Personalizadas</h1>
            <p className="text-muted-foreground">
              Crie e gerencie pesquisas customizadas para eventos específicos
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pesquisa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pesquisas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma pesquisa criada ainda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pesquisas Ativas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aguardando ativação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Respostas Coletadas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total de participações
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Pesquisas</CardTitle>
          <CardDescription>
            Gerencie suas pesquisas personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>Nenhuma pesquisa criada ainda</p>
            <p className="text-sm mb-4">Crie sua primeira pesquisa personalizada para começar</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Pesquisa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de como as pesquisas aparecerão quando criadas */}
      <div className="hidden">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Avaliação do Evento</CardTitle>
                <CardDescription>
                  Pesquisa sobre a experiência geral dos participantes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">Ativa</Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Perguntas</p>
                <p className="text-muted-foreground">8 questões</p>
              </div>
              <div>
                <p className="font-medium">Respostas</p>
                <p className="text-muted-foreground">23 participantes</p>
              </div>
              <div>
                <p className="font-medium">Criada em</p>
                <p className="text-muted-foreground">15/01/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomSurveys;