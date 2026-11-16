-- Modo visitante: uma empresa de demonstração ("demo") com um usuário próprio,
-- usada pelo botão "Entrar como visitante" (POST /usuario/visitante).
-- O usuário visitante não tem senha válida (não entra pelo login normal) e
-- não pode alterar o próprio perfil; o resto do sistema funciona normalmente
-- dentro da empresa de demonstração.
-- Os dados de exemplo só são inseridos se a empresa ainda não tiver caminhões.
-- Só comandos simples (sem bloco DO $$); pode ser executado mais de uma vez.
BEGIN;

ALTER TABLE "Empresa" ADD COLUMN IF NOT EXISTS demo BOOLEAN NOT NULL DEFAULT false;

INSERT INTO "Empresa" (nome, demo)
SELECT 'Empresa de demonstração', true
WHERE NOT EXISTS (SELECT 1 FROM "Empresa" WHERE demo);

-- '!' não é um hash bcrypt válido, então nenhuma senha confere.
INSERT INTO usuario (nome, email, senha, "empresaId")
SELECT 'Visitante', 'visitante@stradus.demo', '!', (SELECT MIN(id) FROM "Empresa" WHERE demo)
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'visitante@stradus.demo');

-- Dados de exemplo (datas relativas a hoje, pra aparecerem no mês atual)
WITH emp AS (
  SELECT e.id FROM "Empresa" e
  WHERE e.demo AND NOT EXISTS (SELECT 1 FROM "Caminhao" c WHERE c."empresaId" = e.id)
  ORDER BY e.id
  LIMIT 1
),
cam AS (
  INSERT INTO "Caminhao" (modelo, ano, placa, "empresaId")
  SELECT v.modelo, v.ano::date, v.placa, emp.id
  FROM emp, (VALUES
    ('Volvo FH 540',  '2021-01-01', 'DEM-1A23'),
    ('Scania R 450',  '2019-01-01', 'DEM-2B34')
  ) AS v (modelo, ano, placa)
  RETURNING id, placa
),
mot AS (
  INSERT INTO "Motorista" ("nomeMotorista", nascimento, "nCarteira", "empresaId")
  SELECT v.nome, v.nascimento::date, v.carteira, emp.id
  FROM emp, (VALUES
    ('João da Silva',   '1982-03-14', '01234567890'),
    ('Carlos Pereira',  '1990-08-27', '09876543210')
  ) AS v (nome, nascimento, carteira)
  RETURNING id, "nomeMotorista"
),
ofi AS (
  INSERT INTO "Oficina" ("nomeOficina", "empresaId")
  SELECT 'Oficina Exemplo', emp.id FROM emp
  RETURNING id
),
fre AS (
  INSERT INTO "Frete" (descricao, valor, data, "caminhaoId", "motoristaId", "porcentagemMotorista", "empresaId")
  SELECT v.descricao, v.valor, CURRENT_DATE - v.dias, cam.id, mot.id, 12, emp.id
  FROM emp, (VALUES
    ('Soja - Sorriso para Paranaguá',  18500.00, 3,  'DEM-1A23', 'João da Silva'),
    ('Milho - Rio Verde para Santos',  14200.00, 9,  'DEM-2B34', 'Carlos Pereira'),
    ('Fertilizante - retorno',          7800.00, 15, 'DEM-1A23', 'João da Silva')
  ) AS v (descricao, valor, dias, placa, motorista)
  JOIN cam ON cam.placa = v.placa
  JOIN mot ON mot."nomeMotorista" = v.motorista
  RETURNING id
)
INSERT INTO "Abastecimento" (litros, "custoTotal", data, "caminhaoId", quilometragem, "empresaId")
SELECT v.litros, v.custo, CURRENT_DATE - v.dias, cam.id, v.km, emp.id
FROM emp, (VALUES
  (420.0, 2604.00, 4,  'DEM-1A23', 182300),
  (380.0, 2356.00, 10, 'DEM-2B34', 341050)
) AS v (litros, custo, dias, placa, km)
JOIN cam ON cam.placa = v.placa;

COMMIT;
