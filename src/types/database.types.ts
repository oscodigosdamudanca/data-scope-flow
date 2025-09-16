// Tipos gerados manualmente para as tabelas do Supabase
// Atualize este arquivo conforme o esquema do banco de dados evolui

export type Tables = {
  raffles: {
    id: string;
    created_at: string;
    title: string;
    description: string;
    prizes: Record<string, any>[];
    draw_date: string;
    is_active: boolean;
    company_id: string;
    created_by: string;
    allow_multiple_wins: boolean;
  };
  
  raffle_participants: {
    id: string;
    created_at: string;
    raffle_id: string;
    lead_id: string;
    is_winner: boolean;
    prize_position: number;
    prize_id: string;
  };
};

// Tipos auxiliares para uso na aplicação
export type Raffle = Tables['raffles'];
export type RaffleParticipant = Tables['raffle_participants'];