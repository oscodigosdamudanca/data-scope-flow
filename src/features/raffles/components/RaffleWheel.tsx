import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RaffleWheelProps {
  raffleId: string;
}

export function RaffleWheel({ raffleId }: RaffleWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [raffle, setRaffle] = useState<any>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadRaffleData = async () => {
      if (!raffleId) return;

      // Carregar dados do sorteio
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();

      if (raffleError) {
        toast({
          title: 'Erro ao carregar sorteio',
          description: raffleError.message,
          variant: 'destructive',
        });
        return;
      }

      setRaffle(raffleData);

      // Carregar prêmios
      const { data: prizesData, error: prizesError } = await supabase
        .from('raffle_prizes')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('prize_order', { ascending: true });

      if (prizesError) {
        toast({
          title: 'Erro ao carregar prêmios',
          description: prizesError.message,
          variant: 'destructive',
        });
        return;
      }

      setPrizes(prizesData || []);

      // Carregar leads elegíveis (com consentimento LGPD)
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', raffleData.company_id)
        .eq('lgpd_consent', true);

      if (leadsError) {
        toast({
          title: 'Erro ao carregar participantes',
          description: leadsError.message,
          variant: 'destructive',
        });
        return;
      }

      setLeads(leadsData || []);
    };

    loadRaffleData();
  }, [raffleId, supabase]);

  const startRaffle = async () => {
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

    setIsSpinning(true);
    setWinners([]);

    // Simular animação de sorteio
    setTimeout(() => {
      drawWinners();
    }, 3000);
  };

  const drawWinners = async () => {
    try {
      let availableLeads = [...leads];
      const newWinners = [];

      // Para cada prêmio, sortear um ganhador
      for (const prize of prizes) {
        if (availableLeads.length === 0) break;

        // Sortear aleatoriamente
        const randomIndex = Math.floor(Math.random() * availableLeads.length);
        const winner = availableLeads[randomIndex];

        newWinners.push({
          prize,
          lead: winner
        });

        // Se não permitir múltiplas vitórias, remover o ganhador da lista
        if (!raffle.allow_multiple_wins) {
          availableLeads = availableLeads.filter(lead => lead.id !== winner.id);
        }

        // Atualizar o prêmio com o ganhador
        await supabase
          .from('raffle_prizes')
          .update({
            winner_id: winner.id,
            drawn_at: new Date().toISOString()
          })
          .eq('id', prize.id);
      }

      setWinners(newWinners);
      setShowResults(true);
      setIsSpinning(false);

      // Lançar confetti para celebrar
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error: any) {
      toast({
        title: 'Erro no sorteio',
        description: error.message,
        variant: 'destructive',
      });
      setIsSpinning(false);
    }
  };

  const shareResults = async () => {
    if (winners.length === 0) return;

    // Criar texto para compartilhamento
    let shareText = `🎉 Resultado do sorteio: ${raffle.name} 🎉\n\n`;
    
    winners.forEach((winner, index) => {
      shareText += `${winner.prize.prize_order}º Prêmio: ${winner.prize.prize_name}\n`;
      shareText += `Ganhador: ${winner.lead.name} (${winner.lead.phone})\n\n`;
    });

    shareText += `Sorteio realizado em: ${new Date().toLocaleDateString()}\n`;
    shareText += `#Sorteio #DataScope`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Resultado do sorteio: ${raffle.name}`,
          text: shareText
        });
      } else {
        // Fallback para copiar para a área de transferência
        await navigator.clipboard.writeText(shareText);
        toast({
          title: 'Copiado!',
          description: 'Resultado do sorteio copiado para a área de transferência.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao compartilhar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sorteio: {raffle?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative w-64 h-64 rounded-full border-8 border-primary overflow-hidden">
              <div 
                className={`w-full h-full bg-gradient-to-r from-primary via-primary/70 to-primary flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}
              >
                <div className="text-white text-center p-4 z-10">
                  {isSpinning ? (
                    <p className="text-xl font-bold">Sorteando...</p>
                  ) : (
                    <p className="text-xl font-bold">Clique em Iniciar</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-2">
                {leads.length} participantes elegíveis
              </p>
              <p className="mb-4">
                {prizes.length} prêmios disponíveis
              </p>
              <Button 
                size="lg" 
                onClick={startRaffle} 
                disabled={isSpinning || leads.length === 0 || prizes.length === 0}
              >
                {isSpinning ? 'Sorteando...' : 'Iniciar Sorteio'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resultado do Sorteio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {winners.map((winner, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">
                  {winner.prize.prize_order}º Prêmio: {winner.prize.prize_name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {winner.prize.prize_description}
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">Ganhador:</p>
                  <p>{winner.lead.name}</p>
                  <p>{winner.lead.phone}</p>
                  <p>{winner.lead.email}</p>
                </div>
              </div>
            ))}

            {raffle?.social_sharing_enabled && (
              <Button 
                className="w-full" 
                onClick={shareResults}
                variant="outline"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar Resultado
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}