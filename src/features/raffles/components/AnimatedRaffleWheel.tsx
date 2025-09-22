import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Share2, Trophy, Users, Gift, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Prize {
  id: string;
  prize_name: string;
  prize_description: string;
  prize_order: number;
  winner_id?: string;
  drawn_at?: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  lgpd_consent: boolean;
}

interface Winner {
  prize: Prize;
  lead: Lead;
}

interface AnimatedRaffleWheelProps {
  raffleId: string;
  onWinnersDrawn?: (winners: Winner[]) => void;
}

export function AnimatedRaffleWheel({ raffleId, onWinnersDrawn }: AnimatedRaffleWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [raffle, setRaffle] = useState<any>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDrawingSequential, setIsDrawingSequential] = useState(false);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // Cores vibrantes para os segmentos da roleta
  const wheelColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  useEffect(() => {
    loadRaffleData();
  }, [raffleId]);

  const loadRaffleData = async () => {
    try {
      // Carregar dados do sorteio
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();

      if (raffleError) throw raffleError;
      setRaffle(raffleData);

      // Carregar prêmios
      const { data: prizesData, error: prizesError } = await supabase
        .from('raffle_prizes')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('prize_order', { ascending: true });

      if (prizesError) throw prizesError;
      setPrizes(prizesData || []);

      // Carregar leads com consentimento LGPD
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', raffleData.company_id)
        .eq('lgpd_consent', true);

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startSequentialDraw = async () => {
    if (leads.length === 0) {
      toast({
        title: 'Sem participantes',
        description: 'Não há leads com consentimento LGPD para participar do sorteio.',
        variant: 'destructive',
      });
      return;
    }

    if (prizes.length === 0) {
      toast({
        title: 'Sem prêmios',
        description: 'Cadastre prêmios antes de iniciar o sorteio.',
        variant: 'destructive',
      });
      return;
    }

    setIsDrawingSequential(true);
    setWinners([]);
    setCurrentPrizeIndex(0);
    
    // Iniciar sorteio sequencial
    drawNextPrize(0, []);
  };

  const drawNextPrize = async (prizeIndex: number, currentWinners: Winner[]) => {
    if (prizeIndex >= prizes.length) {
      // Todos os prêmios foram sorteados
      setIsDrawingSequential(false);
      setShowResults(true);
      
      // Lançar confetti final
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      });

      if (onWinnersDrawn) {
        onWinnersDrawn(currentWinners);
      }
      
      return;
    }

    const currentPrize = prizes[prizeIndex];
    setCurrentPrizeIndex(prizeIndex);
    setIsSpinning(true);

    // Calcular rotação da roleta (múltiplas voltas + posição final aleatória)
    const spins = 5 + Math.random() * 5; // 5-10 voltas
    const finalRotation = wheelRotation + (spins * 360) + (Math.random() * 360);
    setWheelRotation(finalRotation);

    // Aguardar animação da roleta
    setTimeout(async () => {
      try {
        // Filtrar leads disponíveis (remover ganhadores anteriores se não permitir múltiplas vitórias)
        let availableLeads = [...leads];
        if (!raffle.allow_multiple_wins) {
          const winnerIds = currentWinners.map(w => w.lead.id);
          availableLeads = leads.filter(lead => !winnerIds.includes(lead.id));
        }

        if (availableLeads.length === 0) {
          toast({
            title: 'Sem participantes disponíveis',
            description: 'Não há mais participantes elegíveis para este prêmio.',
            variant: 'destructive',
          });
          setIsSpinning(false);
          setIsDrawingSequential(false);
          return;
        }

        // Sortear ganhador
        const randomIndex = Math.floor(Math.random() * availableLeads.length);
        const winner = availableLeads[randomIndex];

        const newWinner: Winner = {
          prize: currentPrize,
          lead: winner
        };

        const updatedWinners = [...currentWinners, newWinner];
        setWinners(updatedWinners);

        // Atualizar prêmio no banco
        await supabase
          .from('raffle_prizes')
          .update({
            winner_id: winner.id,
            drawn_at: new Date().toISOString()
          })
          .eq('id', currentPrize.id);

        setIsSpinning(false);

        // Confetti para este prêmio
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: [wheelColors[prizeIndex % wheelColors.length]]
        });

        // Aguardar um pouco antes do próximo sorteio
        setTimeout(() => {
          drawNextPrize(prizeIndex + 1, updatedWinners);
        }, 2000);

      } catch (error: any) {
        toast({
          title: 'Erro no sorteio',
          description: error.message,
          variant: 'destructive',
        });
        setIsSpinning(false);
        setIsDrawingSequential(false);
      }
    }, 4000); // 4 segundos de animação
  };

  const shareResults = () => {
    if (winners.length === 0) return;

    const resultText = winners
      .map((winner, index) => 
        `🏆 ${winner.prize.prize_order}º Lugar: ${winner.lead.name} - ${winner.prize.prize_name}`
      )
      .join('\n');

    const shareText = `🎉 Resultados do Sorteio: ${raffle?.title}\n\n${resultText}\n\n#Sorteio #Premiação`;

    // Compartilhar via Web Share API se disponível
    if (navigator.share) {
      navigator.share({
        title: `Resultados do Sorteio: ${raffle?.title}`,
        text: shareText,
      });
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copiado!',
        description: 'Resultados copiados para a área de transferência.',
      });
    }
  };

  const resetRaffle = async () => {
    try {
      // Limpar ganhadores dos prêmios
      await supabase
        .from('raffle_prizes')
        .update({ winner_id: null, drawn_at: null })
        .eq('raffle_id', raffleId);

      setWinners([]);
      setShowResults(false);
      setCurrentPrizeIndex(0);
      setWheelRotation(0);

      toast({
        title: 'Sorteio resetado',
        description: 'O sorteio foi resetado e pode ser executado novamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderWheel = () => {
    const segmentAngle = 360 / Math.max(leads.length, 8); // Mínimo 8 segmentos
    const displayLeads = leads.length > 0 ? leads : Array(8).fill({ name: 'Vazio' });

    return (
      <div className="relative w-80 h-80 mx-auto">
        {/* Ponteiro da roleta */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
        
        {/* Roleta */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-8 border-gray-800 shadow-2xl overflow-hidden relative"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
          }}
        >
          {displayLeads.map((lead, index) => {
            const startAngle = index * segmentAngle;
            const color = wheelColors[index % wheelColors.length];
            
            return (
              <div
                key={index}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${startAngle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span 
                    className="text-white font-bold text-xs text-center px-2 transform"
                    style={{ 
                      transform: `rotate(${segmentAngle / 2}deg)`,
                      maxWidth: '80px'
                    }}
                  >
                    {lead.name?.split(' ')[0] || 'Vazio'}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Centro da roleta */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full border-4 border-white flex items-center justify-center z-10">
            <Gift className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">🎰 {raffle?.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{raffle?.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {leads.length} participantes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {prizes.length} prêmios
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {/* Roleta */}
            <div className="flex flex-col items-center space-y-6">
              {renderWheel()}
              
              {/* Status atual */}
              <div className="text-center">
                {isDrawingSequential && (
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      Sorteando {currentPrizeIndex + 1}º Lugar: {prizes[currentPrizeIndex]?.prize_name}
                    </Badge>
                  </div>
                )}
                
                {isSpinning ? (
                  <p className="text-xl font-bold text-primary animate-pulse">
                    🎲 Sorteando...
                  </p>
                ) : isDrawingSequential ? (
                  <p className="text-lg text-muted-foreground">
                    Preparando próximo sorteio...
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    Clique em "Iniciar Sorteio" para começar
                  </p>
                )}
              </div>

              {/* Controles */}
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={startSequentialDraw} 
                  disabled={isDrawingSequential || leads.length === 0 || prizes.length === 0}
                  className="px-8"
                >
                  {isDrawingSequential ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Sorteando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar Sorteio
                    </>
                  )}
                </Button>
                
                {winners.length > 0 && (
                  <>
                    <Button variant="outline" onClick={() => setShowResults(true)}>
                      Ver Resultados
                    </Button>
                    <Button variant="outline" onClick={shareResults}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button variant="destructive" onClick={resetRaffle}>
                      Resetar Sorteio
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Lista de prêmios */}
            {prizes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">🏆 Prêmios do Sorteio</h3>
                <div className="grid gap-3">
                  {prizes.map((prize, index) => (
                    <div 
                      key={prize.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        prize.winner_id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={prize.winner_id ? 'default' : 'secondary'}>
                          {prize.prize_order}º Lugar
                        </Badge>
                        <div>
                          <p className="font-medium">{prize.prize_name}</p>
                          {prize.prize_description && (
                            <p className="text-sm text-muted-foreground">{prize.prize_description}</p>
                          )}
                        </div>
                      </div>
                      
                      {prize.winner_id && (
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {winners.find(w => w.prize.id === prize.id)?.lead.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ganhador(a)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Resultados */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              🎉 Resultados do Sorteio
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {winners.map((winner, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {winner.prize.prize_order}º
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{winner.lead.name}</p>
                    <p className="text-sm text-muted-foreground">{winner.lead.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{winner.prize.prize_name}</p>
                  <p className="text-sm text-muted-foreground">{winner.prize.prize_description}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={shareResults} className="px-6">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar Resultados
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}