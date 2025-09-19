import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Prize {
  id?: string;
  prize_name: string;
  prize_description: string;
  prize_order: number;
}

interface RafflePrizeManagerProps {
  raffleId: string;
}

export function RafflePrizeManager({ raffleId }: RafflePrizeManagerProps) {
  const [prizes, setPrizes] = useState<Prize[]>([
    { prize_name: '', prize_description: '', prize_order: 1 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Carregar prêmios existentes
  useEffect(() => {
    const loadPrizes = async () => {
      if (!raffleId) return;

      const { data, error } = await supabase
        .from('raffle_prizes')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('prize_order', { ascending: true });

      if (error) {
        toast({
          title: 'Erro ao carregar prêmios',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data && data.length > 0) {
        setPrizes(data);
      }
    };

    loadPrizes();
  }, [raffleId, supabase]);

  const handleAddPrize = () => {
    setPrizes([
      ...prizes,
      {
        prize_name: '',
        prize_description: '',
        prize_order: prizes.length + 1,
      },
    ]);
  };

  const handleRemovePrize = (index: number) => {
    if (prizes.length <= 1) {
      toast({
        title: 'Atenção',
        description: 'O sorteio deve ter pelo menos um prêmio.',
      });
      return;
    }

    const newPrizes = [...prizes];
    const removedPrize = newPrizes.splice(index, 1)[0];

    // Reordenar os prêmios restantes
    const updatedPrizes = newPrizes.map((prize, idx) => ({
      ...prize,
      prize_order: idx + 1,
    }));

    setPrizes(updatedPrizes);

    // Se o prêmio já existir no banco, remover
    if (removedPrize.id) {
      deletePrize(removedPrize.id);
    }
  };

  const deletePrize = async (prizeId: string) => {
    const { error } = await supabase
      .from('raffle_prizes')
      .delete()
      .eq('id', prizeId);

    if (error) {
      toast({
        title: 'Erro ao remover prêmio',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePrizeChange = (index: number, field: keyof Prize, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = {
      ...newPrizes[index],
      [field]: value,
    };
    setPrizes(newPrizes);
  };

  const savePrizes = async () => {
    if (!raffleId) return;

    // Validar se todos os prêmios têm nome
    const invalidPrizes = prizes.filter(prize => !prize.prize_name.trim());
    if (invalidPrizes.length > 0) {
      toast({
        title: 'Validação',
        description: 'Todos os prêmios precisam ter um nome.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Para cada prêmio, inserir ou atualizar
      for (const prize of prizes) {
        if (prize.id) {
          // Atualizar prêmio existente
          const { error } = await supabase
            .from('raffle_prizes')
            .update({
              prize_name: prize.prize_name,
              prize_description: prize.prize_description,
              prize_order: prize.prize_order,
            })
            .eq('id', prize.id);

          if (error) throw error;
        } else {
          // Inserir novo prêmio
          const { error } = await supabase
            .from('raffle_prizes')
            .insert({
              raffle_id: raffleId,
              prize_name: prize.prize_name,
              prize_description: prize.prize_description,
              prize_order: prize.prize_order,
            });

          if (error) throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Prêmios salvos com sucesso!',
      });

      // Recarregar prêmios para obter IDs atualizados
      const { data } = await supabase
        .from('raffle_prizes')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('prize_order', { ascending: true });

      if (data) {
        setPrizes(data);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar prêmios',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Prêmios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prizes.map((prize, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1 flex items-center justify-center pt-8">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                  {prize.prize_order}º
                </div>
              </div>
              <div className="col-span-4">
                <Label htmlFor={`prize-name-${index}`}>Nome do Prêmio</Label>
                <Input
                  id={`prize-name-${index}`}
                  value={prize.prize_name}
                  onChange={(e) => handlePrizeChange(index, 'prize_name', e.target.value)}
                  placeholder="Ex: Smartphone, Vale Presente, etc."
                />
              </div>
              <div className="col-span-6">
                <Label htmlFor={`prize-desc-${index}`}>Descrição</Label>
                <Textarea
                  id={`prize-desc-${index}`}
                  value={prize.prize_description}
                  onChange={(e) => handlePrizeChange(index, 'prize_description', e.target.value)}
                  placeholder="Detalhes do prêmio"
                  rows={2}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePrize(index)}
                  title="Remover prêmio"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPrize}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Prêmio
            </Button>
            <Button
              type="button"
              onClick={savePrizes}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Prêmios'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}