-- Criação da tabela de tipos de perguntas
CREATE TABLE IF NOT EXISTS question_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  input_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona políticas RLS para a tabela
ALTER TABLE question_types ENABLE ROW LEVEL SECURITY;

-- Política para desenvolvedor (acesso total)
CREATE POLICY "Desenvolvedores podem gerenciar todos os tipos de perguntas" 
ON question_types 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'app_role' = 'developer');

-- Inserir dados iniciais
INSERT INTO question_types (name, description, input_type) VALUES
('Texto Curto', 'Resposta em texto com limite de caracteres', 'text'),
('Texto Longo', 'Resposta em texto sem limite de caracteres', 'textarea'),
('Múltipla Escolha', 'Seleção de uma opção entre várias', 'radio'),
('Caixas de Seleção', 'Seleção de múltiplas opções', 'checkbox'),
('Escala', 'Avaliação em escala numérica', 'range');