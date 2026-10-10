-- Multiempresa: cada usuário pertence a uma empresa e só enxerga/altera os
-- dados dela. Todos os usuários e dados que já existiam ficam numa mesma
-- empresa ("Empresa principal"); cada novo cadastro cria a sua própria.
-- Estado, Cidade e Carga continuam compartilhadas (são cadastros de referência).
-- Tabelas filhas (ManutencaoParcela, CustoFixoAjuste, FazendaContato, Nota)
-- herdam a empresa do registro pai.
-- Só comandos simples (sem bloco DO $$) pra rodar em qualquer editor SQL;
-- pode ser executado mais de uma vez.
BEGIN;

CREATE TABLE IF NOT EXISTS "Empresa" (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  "criadoEm"  TIMESTAMP DEFAULT now()
);

INSERT INTO "Empresa" (nome)
SELECT 'Empresa principal'
WHERE NOT EXISTS (SELECT 1 FROM "Empresa");

-- usuario
ALTER TABLE "usuario" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "usuario" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "usuario" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS usuario_empresa_idx ON "usuario" ("empresaId");

-- Caminhao
ALTER TABLE "Caminhao" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Caminhao" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Caminhao" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS caminhao_empresa_idx ON "Caminhao" ("empresaId");

-- Motorista
ALTER TABLE "Motorista" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Motorista" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Motorista" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS motorista_empresa_idx ON "Motorista" ("empresaId");

-- Oficina
ALTER TABLE "Oficina" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Oficina" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Oficina" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS oficina_empresa_idx ON "Oficina" ("empresaId");

-- Caminhao_Motorista
ALTER TABLE "Caminhao_Motorista" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Caminhao_Motorista" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Caminhao_Motorista" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS caminhao_motorista_empresa_idx ON "Caminhao_Motorista" ("empresaId");

-- Manutencao
ALTER TABLE "Manutencao" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Manutencao" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Manutencao" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS manutencao_empresa_idx ON "Manutencao" ("empresaId");

-- Abastecimento
ALTER TABLE "Abastecimento" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Abastecimento" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Abastecimento" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS abastecimento_empresa_idx ON "Abastecimento" ("empresaId");

-- Frete
ALTER TABLE "Frete" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Frete" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Frete" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS frete_empresa_idx ON "Frete" ("empresaId");

-- CustoFixo
ALTER TABLE "CustoFixo" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "CustoFixo" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "CustoFixo" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS custofixo_empresa_idx ON "CustoFixo" ("empresaId");

-- Fazenda
ALTER TABLE "Fazenda" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Fazenda" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Fazenda" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS fazenda_empresa_idx ON "Fazenda" ("empresaId");

-- Documento
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "empresaId" INTEGER REFERENCES "Empresa"(id);
UPDATE "Documento" SET "empresaId" = (SELECT MIN(id) FROM "Empresa") WHERE "empresaId" IS NULL;
ALTER TABLE "Documento" ALTER COLUMN "empresaId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS documento_empresa_idx ON "Documento" ("empresaId");

COMMIT;
