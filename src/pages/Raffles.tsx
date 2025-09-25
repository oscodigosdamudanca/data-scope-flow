import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/core';
import { Gift, Plus, Play, Pause, Trophy, Users, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatedRaffleWheel } from '@/features/raffles/components/AnimatedRaffleWheel';
import { useState } from 'react';

export const Raffles = () => {
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  
  const raffles = [
    {
      id: '1',
      title: 'Sorteio de Brindes',
      description: 'Sorteio de produtos promocionais para participantes',
      status: 'active',
      participants: 45,
      prizes: 3,
      endDate: '2025-01-25',
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      title: 'Prêmio Principal',
      description: 'Sorteio do prêmio principal do evento',
      status: 'draft',
      participants: 0,
      prizes: 1,
      endDate: '2025-01-30',
      createdAt: '2025-01-18'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Ativo</Badge>;
      case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
      case 'finished': return <Badge variant="outline">Finalizado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStartRaffle = (raffleId: string) => {
    setSelectedRaffleId(raffleId);
    setShowWheel(true);
  };

  const handleBackToList = () => {
    setShowWheel(false);
    setSelectedRaffleId(null);
  };

  const totalParticipants = raffles.reduce((sum, raffle) => sum + raffle.participants, 0);
  const totalPrizes = raffles.reduce((sum, raffle) => sum + raffle.prizes, 0);
  const activeRaffles = raffles.filter(raffle => raffle.status === 'active').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {showWheel && selectedRaffleId ? (
        // Tela da Roleta Animada
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToList}>
              ← Voltar para Lista
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sorteio em Andamento</h1>
              <p className="text-muted-foreground">
                Roleta animada para sorteio de prêmios
              </p>
            </div>
          </div>
          
          <AnimatedRaffleWheel 
            raffleId={selectedRaffleId}
            onWinnersDrawn={(winners) => {
              console.log('Ganhadores sorteados:', winners);
            }}
          />
        </div>
      ) : (
        // Tela da Lista de Sorteios
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BackToDashboard variant="outline" position="header" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sorteios</h1>
                <p className="text-muted-foreground">
                  Gerencie sorteios e premiações para engajar participantes
                </p>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Sorteio
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sorteios Ativos
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRaffles}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Participantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Inscritos nos sorteios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prêmios Disponíveis
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrizes}</div>
            <p className="text-xs text-muted-foreground">
              Para serem sorteados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Participação
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              Dos leads participando
            </p>
          </CardContent>
        </Card>
        </div>

        <div className="grid gap-6">
        {raffles.length > 0 ? (
          raffles.map((raffle) => (
            <Card key={raffle.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{raffle.title}</CardTitle>
                    <CardDescription>{raffle.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(raffle.status)}
                    {raffle.status === 'active' ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStartRaffle(raffle.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Sorteio
                        </Button>
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Ativar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Participantes</p>
                    <p className="text-lg font-semibold">{raffle.participants}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Prêmios</p>
                    <p className="text-lg font-semibold">{raffle.prizes}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Encerra em</p>
                    <p className="text-lg font-semibold">{new Date(raffle.endDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Criado em</p>
                    <p className="text-lg font-semibold">{new Date(raffle.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Ver Participantes
                  </Button>
                  <Button variant="outline" size="sm">
                    Configurar Prêmios
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar Sorteio
                  </Button>
                  {raffle.status === 'active' && (
                    <Button size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Realizar Sorteio
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Seus Sorteios</CardTitle>
              <CardDescription>
                Crie e gerencie sorteios para engajar seus participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum sorteio criado ainda</p>
                <p className="text-sm mb-4">Crie seu primeiro sorteio para começar a engajar participantes</p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Sorteio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Raffles;