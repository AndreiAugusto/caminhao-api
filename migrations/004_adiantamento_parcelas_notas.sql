-- 1) O desconto de um adiantamento pode ser dividido em vários salários:
--    cada parcela diz de qual mês/ano sai e quanto. Substitui as colunas
--    "mesDesconto"/"anoDesconto" (os adiantamentos existentes viram 1 parcela).
-- 2) Adiantamentos também podem ter notas (comprovantes) anexadas.
-- Só comandos simples (sem bloco DO $$); pode ser executado mais de uma vez.
BEGIN;

CREATE TABLE IF NOT EXISTS "AdiantamentoParcela" (
  id                SERIAL PRIMARY KEY,
  "adiantamentoId"  INTEGER NOT NULL REFERENCES "Adiantamento"(id) ON DELETE CASCADE,
  numero            INTEGER NOT NULL,
  mes               INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano               INTEGER NOT NULL,
  valor             NUMERIC(12, 2) NOT NULL CHECK (valor > 0)
);

CREATE INDEX IF NOT EXISTS adiantamento_parcela_adiantamento_idx ON "AdiantamentoParcela" ("adiantamentoId");
CREATE INDEX IF NOT EXISTS adiantamento_parcela_competencia_idx ON "AdiantamentoParcela" (ano, mes);

-- Lê as colunas antigas via to_jsonb pra este comando continuar válido
-- depois que elas forem removidas (re-execução não faz nada).
INSERT INTO "AdiantamentoParcela" ("adiantamentoId", numero, mes, ano, valor)
SELECT a.id, 1, (to_jsonb(a) ->> 'mesDesconto')::int, (to_jsonb(a) ->> 'anoDesconto')::int, a.valor
FROM "Adiantamento" a
WHERE to_jsonb(a) ->> 'mesDesconto' IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "AdiantamentoParcela" p WHERE p."adiantamentoId" = a.id);

ALTER TABLE "Adiantamento" DROP COLUMN IF EXISTS "mesDesconto";
ALTER TABLE "Adiantamento" DROP COLUMN IF EXISTS "anoDesconto";
CREATE INDEX IF NOT EXISTS adiantamento_empresa_data_idx ON "Adiantamento" ("empresaId", data);

ALTER TABLE "Nota" ADD COLUMN IF NOT EXISTS "adiantamentoId" INTEGER REFERENCES "Adiantamento"(id) ON DELETE CASCADE;
ALTER TABLE "Nota" DROP CONSTRAINT IF EXISTS nota_um_vinculo;
ALTER TABLE "Nota" ADD CONSTRAINT nota_um_vinculo CHECK (num_nonnulls("freteId", "manutencaoId", "adiantamentoId") = 1);
CREATE INDEX IF NOT EXISTS nota_adiantamento_idx ON "Nota" ("adiantamentoId");

COMMIT;
