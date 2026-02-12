-- Adicionar comentário explicativo
COMMENT ON TABLE inspecoes_cilindros IS 'Tabela de inspeções diárias de cilindros com suporte a confirmação de pedidos';

-- Adicionar novos campos
ALTER TABLE inspecoes_cilindros
  ADD COLUMN IF NOT EXISTS precisa_oxigenio_grande boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS qtd_oxigenio_grande integer,
  ADD COLUMN IF NOT EXISTS precisa_oxigenio_pequeno boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS qtd_oxigenio_pequeno integer,
  ADD COLUMN IF NOT EXISTS confirmation_token text,
  ADD COLUMN IF NOT EXISTS confirmation_token_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS confirmado_em timestamp with time zone,
  ADD COLUMN IF NOT EXISTS confirmado_por text;

-- Adicionar constraints
ALTER TABLE inspecoes_cilindros
  ADD CONSTRAINT unique_confirmation_token UNIQUE (confirmation_token),
  ADD CONSTRAINT check_qtd_oxigenio_grande_positive CHECK (qtd_oxigenio_grande IS NULL OR qtd_oxigenio_grande >= 0),
  ADD CONSTRAINT check_qtd_oxigenio_pequeno_positive CHECK (qtd_oxigenio_pequeno IS NULL OR qtd_oxigenio_pequeno >= 0);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_confirmation_token ON inspecoes_cilindros(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_confirmado_em ON inspecoes_cilindros(confirmado_em);
