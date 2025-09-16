# Instruções para Criação das Tabelas Faltantes

Este documento contém instruções para criar manualmente as tabelas faltantes no banco de dados Supabase.

## Tabelas Faltantes Identificadas

Com base nos logs analisados, as seguintes tabelas estão faltando ou apresentam problemas:

1. `sorteios` (ou `raffles`) - Tabela completamente ausente
2. `raffle_participants` - Tabela para relacionamento entre sorteios e participantes
3. `pg_tables` - Problemas de permissão para acesso (necessário para geração de tipos TypeScript)

## Script SQL para Criação das Tabelas

O script SQL abaixo deve ser executado no SQL Editor do Supabase para criar as tabelas faltantes:

```sql
-- Script para criar as tabelas faltantes no banco de dados

-- Criar tabela sorteios (raffles)
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    prize_description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    winner_id UUID REFERENCES leads(id),
    drawn_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de participantes do sorteio
CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(raffle_id, lead_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_raffles_company_id ON public.raffles(company_id);
CREATE INDEX IF NOT EXISTS idx_raffles_is_active ON public.raffles(is_active);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON public.raffle_participants(raffle_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para a tabela sorteios
CREATE POLICY "Raffles: select for authenticated users" ON public.raffles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffles: insert for authenticated users" ON public.raffles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffles: update for authenticated users" ON public.raffles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffles: delete for authenticated users" ON public.raffles
    FOR DELETE TO authenticated USING (true);

-- Criar políticas RLS para a tabela participantes do sorteio
CREATE POLICY "Raffle participants: select for authenticated users" ON public.raffle_participants
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Raffle participants: insert for authenticated users" ON public.raffle_participants
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Raffle participants: update for authenticated users" ON public.raffle_participants
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Raffle participants: delete for authenticated users" ON public.raffle_participants
    FOR DELETE TO authenticated USING (true);

-- Criar trigger para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger às tabelas
CREATE TRIGGER update_raffles_updated_at
    BEFORE UPDATE ON public.raffles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conceder permissões para acessar pg_tables (necessário para geração de tipos TypeScript)
GRANT SELECT ON pg_tables TO authenticated;
GRANT SELECT ON pg_type TO authenticated;
GRANT SELECT ON pg_attribute TO authenticated;
GRANT SELECT ON pg_class TO authenticated;
GRANT SELECT ON pg_namespace TO authenticated;
GRANT SELECT ON pg_constraint TO authenticated;
```

## Passos para Execução Manual

1. Acesse o painel de controle do Supabase para o projeto
2. Navegue até a seção "SQL Editor"
3. Crie um novo script SQL
4. Cole o conteúdo do script acima
5. Execute o script completo
6. Verifique se as tabelas foram criadas com sucesso usando a consulta:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('raffles', 'raffle_participants');
   ```

## Verificação de Permissões

Para verificar se as permissões para `pg_tables` foram concedidas corretamente:

```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'pg_tables' 
AND grantee = 'authenticated';
```

## Após a Criação das Tabelas

Depois de criar as tabelas, execute o script de sincronização de tipos para atualizar os tipos TypeScript:

```bash
npm run sync-types
```

Isso deve resolver os problemas de geração de tipos TypeScript e permitir que o aplicativo funcione corretamente.