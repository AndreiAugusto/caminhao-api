-- Adiantamentos de salário dos motoristas. Cada adiantamento é descontado
-- do salário de um mês específico ("mesDesconto"/"anoDesconto"), que por
-- padrão é o mês em que o adiantamento foi feito.
CREATE TABLE IF NOT EXISTS "Adiantamento" (
  id              SERIAL PRIMARY KEY,
  "empresaId"     INTEGER NOT NULL REFERENCES "Empresa"(id),
  "motoristaId"   INTEGER NOT NULL REFERENCES "Motorista"(id) ON DELETE CASCADE,
  valor           NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  data            DATE NOT NULL,
  "mesDesconto"   INTEGER NOT NULL CHECK ("mesDesconto" BETWEEN 1 AND 12),
  "anoDesconto"   INTEGER NOT NULL,
  observacao      TEXT,
  "criadoEm"      TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS adiantamento_empresa_competencia_idx
  ON "Adiantamento" ("empresaId", "anoDesconto", "mesDesconto");
CREATE INDEX IF NOT EXISTS adiantamento_motorista_idx ON "Adiantamento" ("motoristaId");
