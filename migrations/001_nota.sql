-- Notas (fotos/PDFs) anexadas a fretes e manutenções.
-- O arquivo fica no Vercel Blob (privado); aqui só guardamos a referência.
CREATE TABLE IF NOT EXISTS "Nota" (
  id              SERIAL PRIMARY KEY,
  "freteId"       INTEGER REFERENCES "Frete"(id) ON DELETE CASCADE,
  "manutencaoId"  INTEGER REFERENCES "Manutencao"(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  "nomeArquivo"   TEXT NOT NULL,
  "mimeType"      TEXT,
  tamanho         INTEGER,
  "criadoEm"      TIMESTAMP DEFAULT now(),
  CONSTRAINT nota_um_vinculo CHECK (("freteId" IS NULL) <> ("manutencaoId" IS NULL))
);

CREATE INDEX IF NOT EXISTS nota_frete_idx ON "Nota" ("freteId");
CREATE INDEX IF NOT EXISTS nota_manutencao_idx ON "Nota" ("manutencaoId");
