type Vinculos = {
  caminhaoId?: number | null;
  motoristaId?: number | null;
  oficinaId?: number | null;
  fazendaId?: number | null;
};

export const VINCULO_INVALIDO = { message: 'Caminhão, motorista, oficina ou fazenda não encontrado!', error: true };

/**
 * Confere se os registros referenciados no corpo da requisição pertencem à
 * empresa do usuário. Sem isso daria pra vincular (e enxergar pelos JOINs)
 * o caminhão/motorista/... de outra empresa só informando o id.
 * Ids ausentes (null/undefined) não são checados.
 */
export async function vinculosDaEmpresa(sql: any, empresaId: number, vinculos: Vinculos): Promise<boolean> {
  const caminhaoId = vinculos.caminhaoId ?? null;
  const motoristaId = vinculos.motoristaId ?? null;
  const oficinaId = vinculos.oficinaId ?? null;
  const fazendaId = vinculos.fazendaId ?? null;

  const rows = await sql`
    SELECT
      (${caminhaoId}::int IS NULL OR EXISTS (SELECT 1 FROM "Caminhao" WHERE id = ${caminhaoId}::int AND "empresaId" = ${empresaId}))
      AND (${motoristaId}::int IS NULL OR EXISTS (SELECT 1 FROM "Motorista" WHERE id = ${motoristaId}::int AND "empresaId" = ${empresaId}))
      AND (${oficinaId}::int IS NULL OR EXISTS (SELECT 1 FROM "Oficina" WHERE id = ${oficinaId}::int AND "empresaId" = ${empresaId}))
      AND (${fazendaId}::int IS NULL OR EXISTS (SELECT 1 FROM "Fazenda" WHERE id = ${fazendaId}::int AND "empresaId" = ${empresaId}))
      AS ok
  `;
  return rows[0].ok;
}
