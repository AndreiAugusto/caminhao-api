import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async manutencaoCount(empresaId: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "empresaId" = ${empresaId}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções!', error };
    }
  }

  async oficinaCount(empresaId: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Oficina" WHERE "empresaId" = ${empresaId}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar oficinas!', error };
    }
  }

  async oficinaCountOne(empresaId: number, id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "oficinaId" = ${id} AND "empresaId" = ${empresaId}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções de oficina!', error };
    }
  }

  async caminhaoCount(empresaId: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Caminhao" WHERE "empresaId" = ${empresaId}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar caminhões!', error };
    }
  }

  async caminhaoCountOne(empresaId: number, id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "caminhaoId" = ${id} AND "empresaId" = ${empresaId}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções de caminhão!', error };
    }
  }

  async motoristaPagamento(empresaId: number, id: number, mes: number, ano: number) {
    try {
      const data = await this.sql`
        SELECT
          m."nomeMotorista",
          COALESCE(SUM(f.valor * f."porcentagemMotorista" / 100), 0) AS "totalReceber",
          COUNT(f.id) AS "totalFretes",
          COALESCE(SUM(f.valor), 0) AS "totalFretesBruto"
        FROM "Motorista" m
        LEFT JOIN "Frete" f
          ON f."motoristaId" = m.id
          AND EXTRACT(MONTH FROM f.data) = ${mes}
          AND EXTRACT(YEAR FROM f.data) = ${ano}
        WHERE m.id = ${id} AND m."empresaId" = ${empresaId}
        GROUP BY m.id, m."nomeMotorista"
      `;
      return data[0] ?? null;
    } catch (error) {
      return { message: 'Erro ao calcular pagamento do motorista!', error };
    }
  }

  async salariosMes(empresaId: number, mes: number, ano: number) {
    try {
      const data = await this.sql`
        SELECT
          m.id AS "motoristaId",
          m."nomeMotorista",
          COUNT(f.id) AS "totalFretes",
          COALESCE(SUM(f.valor), 0) AS "totalFretesBruto",
          COALESCE(SUM(f.valor * f."porcentagemMotorista" / 100), 0) AS "totalReceber",
          COALESCE(MAX(desconto.total), 0) AS "totalAdiantamentos",
          COALESCE(SUM(f.valor * f."porcentagemMotorista" / 100), 0) - COALESCE(MAX(desconto.total), 0) AS "saldoPagar",
          COALESCE(MAX(adiantado.total), 0) AS "adiantadoNoMes",
          COALESCE(SUM(f.valor * f."porcentagemMotorista" / 100), 0) - COALESCE(MAX(desconto.total), 0)
            + COALESCE(MAX(adiantado.total), 0) AS "totalMes"
        FROM "Motorista" m
        LEFT JOIN "Frete" f
          ON f."motoristaId" = m.id
          AND EXTRACT(MONTH FROM f.data) = ${mes}
          AND EXTRACT(YEAR FROM f.data) = ${ano}
        -- parcelas de adiantamentos descontadas do salário deste mês
        LEFT JOIN (
          SELECT a."motoristaId", SUM(ap.valor) AS total
          FROM "AdiantamentoParcela" ap
          JOIN "Adiantamento" a ON a.id = ap."adiantamentoId"
          WHERE a."empresaId" = ${empresaId} AND ap.mes = ${mes} AND ap.ano = ${ano}
          GROUP BY a."motoristaId"
        ) desconto ON desconto."motoristaId" = m.id
        -- adiantamentos entregues neste mês (saem do caixa agora, descontam depois)
        LEFT JOIN (
          SELECT "motoristaId", SUM(valor) AS total
          FROM "Adiantamento"
          WHERE "empresaId" = ${empresaId}
            AND EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
          GROUP BY "motoristaId"
        ) adiantado ON adiantado."motoristaId" = m.id
        WHERE m."empresaId" = ${empresaId}
        GROUP BY m.id, m."nomeMotorista"
        ORDER BY m."nomeMotorista"
      `;
      return data;
    } catch (error) {
      return { message: 'Erro ao calcular salários do mês!', error };
    }
  }

  async ultimasMovimentacoes(empresaId: number, limite: number) {
    try {
      const data = await this.sql`
        SELECT * FROM (
          SELECT
            'frete' AS tipo,
            f.id,
            f.data,
            f.valor AS valor,
            COALESCE(f.descricao, CONCAT(origem.nome, ' → ', destino.nome)) AS descricao,
            c.placa AS "identificador"
          FROM "Frete" f
          JOIN "Caminhao" c ON c.id = f."caminhaoId"
          LEFT JOIN "Cidade" origem ON origem.id = f.origem
          LEFT JOIN "Cidade" destino ON destino.id = f.destino
          WHERE f."empresaId" = ${empresaId}

          UNION ALL

          SELECT
            'manutencao' AS tipo,
            m.id,
            m.data,
            m.custo AS valor,
            m.descricao,
            c.placa AS "identificador"
          FROM "Manutencao" m
          JOIN "Caminhao" c ON c.id = m."caminhaoId"
          WHERE m."empresaId" = ${empresaId}

          UNION ALL

          SELECT
            'abastecimento' AS tipo,
            a.id,
            a.data,
            a."custoTotal" AS valor,
            CONCAT(a.litros, ' litros') AS descricao,
            c.placa AS "identificador"
          FROM "Abastecimento" a
          JOIN "Caminhao" c ON c.id = a."caminhaoId"
          WHERE a."empresaId" = ${empresaId}
        ) movimentacoes
        ORDER BY data DESC
        LIMIT ${limite}
      `;
      return data;
    } catch (error) {
      return { message: 'Erro ao buscar últimas movimentações!', error };
    }
  }

  async resumoMes(empresaId: number, mes: number, ano: number) {
    try {
      const [fretes, manutencoes, abastecimentos, custosFixos, salarios] = await Promise.all([
        this.sql`
          SELECT
            COUNT(*) AS "totalFretes",
            COALESCE(SUM(valor), 0) AS "receitaBruta"
          FROM "Frete"
          WHERE "empresaId" = ${empresaId}
            AND EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalManutencoes",
            COALESCE(SUM(mp.valor), 0) AS "custoManutencoes"
          FROM "ManutencaoParcela" mp
          JOIN "Manutencao" m ON m.id = mp."manutencaoId"
          WHERE m."empresaId" = ${empresaId}
            AND EXTRACT(MONTH FROM mp."dataVencimento") = ${mes}
            AND EXTRACT(YEAR FROM mp."dataVencimento") = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalAbastecimentos",
            COALESCE(SUM("custoTotal"), 0) AS "custoAbastecimentos"
          FROM "Abastecimento"
          WHERE "empresaId" = ${empresaId}
            AND EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalCustosFixos",
            COALESCE(SUM(COALESCE(aj.valor, cf.valor)), 0) AS "custoFixo"
          FROM "CustoFixo" cf
          LEFT JOIN "CustoFixoAjuste" aj ON aj."custoFixoId" = cf.id AND aj.ano = ${ano} AND aj.mes = ${mes}
          WHERE cf."empresaId" = ${empresaId}
            AND cf."dataInicio" <= (DATE_TRUNC('month', MAKE_DATE(${ano}, ${mes}, 1)) + INTERVAL '1 month - 1 day')
            AND (cf."dataFim" IS NULL OR cf."dataFim" >= DATE_TRUNC('month', MAKE_DATE(${ano}, ${mes}, 1)))
        `,
        this.sql`
          SELECT COALESCE(SUM(valor * "porcentagemMotorista" / 100), 0) AS "custoSalarios"
          FROM "Frete"
          WHERE "empresaId" = ${empresaId}
            AND EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
      ]);

      const receitaBruta = Number(fretes[0].receitaBruta);
      const custoManutencoes = Number(manutencoes[0].custoManutencoes);
      const custoAbastecimentos = Number(abastecimentos[0].custoAbastecimentos);
      const custoFixo = Number(custosFixos[0].custoFixo);
      const custoSalarios = Number(salarios[0].custoSalarios);
      const saldoLiquido = receitaBruta - custoManutencoes - custoAbastecimentos - custoFixo - custoSalarios;

      return {
        mes,
        ano,
        fretes: {
          total: Number(fretes[0].totalFretes),
          receitaBruta,
        },
        manutencoes: {
          total: Number(manutencoes[0].totalManutencoes),
          custo: custoManutencoes,
        },
        abastecimentos: {
          total: Number(abastecimentos[0].totalAbastecimentos),
          custo: custoAbastecimentos,
        },
        custosFixos: {
          total: Number(custosFixos[0].totalCustosFixos),
          custo: custoFixo,
        },
        salarios: {
          custo: custoSalarios,
        },
        saldoLiquido,
      };
    } catch (error) {
      return { message: 'Erro ao buscar resumo do mês!', error };
    }
  }

  async extrato(empresaId: number, filtros: {
    dataInicio?: string;
    dataFim?: string;
    tipos?: string[];
    caminhaoId?: number;
    motoristaId?: number;
  }) {
    try {
      const dataInicio = filtros.dataInicio ?? '2000-01-01';
      const hoje = new Date();
      const ultimoDiaMesAtual = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 0))
        .toISOString()
        .slice(0, 10);
      const dataFim = filtros.dataFim ?? ultimoDiaMesAtual;

      const tiposSet = filtros.tipos && filtros.tipos.length > 0 ? new Set(filtros.tipos) : null;
      const incluirFrete = !tiposSet || tiposSet.has('frete');
      const incluirAbastecimento = !tiposSet || tiposSet.has('abastecimento');
      const incluirManutencao = !tiposSet || tiposSet.has('manutencao');
      const incluirCustoFixo = !tiposSet || tiposSet.has('custo-fixo');
      const incluirSalarios = !tiposSet || tiposSet.has('salario-motorista');
      // 'adiantamento' traz a entrega (despesa) e as parcelas descontadas (informativas).
      const incluirAdiantamentos = !tiposSet || tiposSet.has('adiantamento');

      const caminhaoId = filtros.caminhaoId ?? null;
      const motoristaId = filtros.motoristaId ?? null;

      const data = await this.sql`
        SELECT * FROM (
          SELECT
            'frete' AS tipo,
            f.data,
            c.placa,
            m."nomeMotorista" AS motorista,
            fz.nome AS empresa,
            COALESCE(f.descricao, 'Frete') AS historico,
            NULL::numeric AS despesas,
            f.valor AS receitas,
            NULL::float8 AS "descontoAdiantamento"
          FROM "Frete" f
          JOIN "Caminhao" c ON c.id = f."caminhaoId"
          JOIN "Motorista" m ON m.id = f."motoristaId"
          LEFT JOIN "Fazenda" fz ON fz.id = f."fazendaId"
          WHERE ${incluirFrete}::boolean
            AND f."empresaId" = ${empresaId}
            AND f.data BETWEEN ${dataInicio}::date AND ${dataFim}::date
            AND (${caminhaoId}::int IS NULL OR f."caminhaoId" = ${caminhaoId}::int)
            AND (${motoristaId}::int IS NULL OR f."motoristaId" = ${motoristaId}::int)

          UNION ALL

          SELECT
            'abastecimento' AS tipo,
            a.data,
            c.placa,
            NULL::text AS motorista,
            NULL::text AS empresa,
            CONCAT(a.litros, ' litros') AS historico,
            a."custoTotal" AS despesas,
            NULL::numeric AS receitas,
            NULL::float8 AS "descontoAdiantamento"
          FROM "Abastecimento" a
          JOIN "Caminhao" c ON c.id = a."caminhaoId"
          WHERE ${incluirAbastecimento}::boolean
            AND a."empresaId" = ${empresaId}
            AND a.data BETWEEN ${dataInicio}::date AND ${dataFim}::date
            AND (${caminhaoId}::int IS NULL OR a."caminhaoId" = ${caminhaoId}::int)
            AND ${motoristaId}::int IS NULL

          UNION ALL

          SELECT
            'manutencao' AS tipo,
            mp."dataVencimento" AS data,
            c.placa,
            NULL::text AS motorista,
            o."nomeOficina" AS empresa,
            COALESCE(m.descricao, 'Manutenção') AS historico,
            mp.valor AS despesas,
            NULL::numeric AS receitas,
            NULL::float8 AS "descontoAdiantamento"
          FROM "ManutencaoParcela" mp
          JOIN "Manutencao" m ON m.id = mp."manutencaoId"
          JOIN "Caminhao" c ON c.id = m."caminhaoId"
          JOIN "Oficina" o ON o.id = m."oficinaId"
          WHERE ${incluirManutencao}::boolean
            AND m."empresaId" = ${empresaId}
            AND mp."dataVencimento" BETWEEN ${dataInicio}::date AND ${dataFim}::date
            AND (${caminhaoId}::int IS NULL OR m."caminhaoId" = ${caminhaoId}::int)
            AND ${motoristaId}::int IS NULL

          UNION ALL

          SELECT
            'custo-fixo' AS tipo,
            gs.mes::date AS data,
            c.placa,
            NULL::text AS motorista,
            COALESCE(cf.categoria, 'Custo Fixo') AS empresa,
            cf.descricao AS historico,
            COALESCE(aj.valor, cf.valor) AS despesas,
            NULL::numeric AS receitas,
            NULL::float8 AS "descontoAdiantamento"
          FROM "CustoFixo" cf
          LEFT JOIN "Caminhao" c ON c.id = cf."caminhaoId"
          CROSS JOIN LATERAL generate_series(
            GREATEST(DATE_TRUNC('month', cf."dataInicio"), DATE_TRUNC('month', ${dataInicio}::date)),
            LEAST(DATE_TRUNC('month', COALESCE(cf."dataFim", ${dataFim}::date)), DATE_TRUNC('month', ${dataFim}::date)),
            INTERVAL '1 month'
          ) AS gs(mes)
          LEFT JOIN "CustoFixoAjuste" aj
            ON aj."custoFixoId" = cf.id
            AND aj.ano = EXTRACT(YEAR FROM gs.mes)
            AND aj.mes = EXTRACT(MONTH FROM gs.mes)
          WHERE ${incluirCustoFixo}::boolean
            AND cf."empresaId" = ${empresaId}
            AND (${caminhaoId}::int IS NULL OR cf."caminhaoId" = ${caminhaoId}::int)
            AND ${motoristaId}::int IS NULL

          UNION ALL

          -- Salário líquido: comissão do mês menos as parcelas de adiantamento
          -- descontadas nele (o adiantamento já saiu como despesa na data em que foi entregue).
          SELECT
            'salario-motorista' AS tipo,
            sal.mes AS data,
            NULL::text AS placa,
            sal."nomeMotorista" AS motorista,
            NULL::text AS empresa,
            CONCAT('Salário ', TO_CHAR(sal.mes, 'MM/YYYY')) AS historico,
            GREATEST(sal.comissao - COALESCE(desconto.total, 0), 0)::float8 AS despesas,
            NULL::numeric AS receitas,
            desconto.total::float8 AS "descontoAdiantamento"
          FROM (
            SELECT
              (DATE_TRUNC('month', f.data))::date AS mes,
              m.id AS "motoristaId",
              m."nomeMotorista",
              SUM(f.valor * f."porcentagemMotorista" / 100) AS comissao
            FROM "Frete" f
            JOIN "Motorista" m ON m.id = f."motoristaId"
            WHERE ${incluirSalarios}::boolean
              AND f."empresaId" = ${empresaId}
              AND f.data BETWEEN ${dataInicio}::date AND ${dataFim}::date
              AND (${motoristaId}::int IS NULL OR f."motoristaId" = ${motoristaId}::int)
              AND ${caminhaoId}::int IS NULL
            GROUP BY DATE_TRUNC('month', f.data), m.id, m."nomeMotorista"
          ) sal
          LEFT JOIN (
            SELECT a."motoristaId", MAKE_DATE(ap.ano, ap.mes, 1) AS mes, SUM(ap.valor) AS total
            FROM "AdiantamentoParcela" ap
            JOIN "Adiantamento" a ON a.id = ap."adiantamentoId"
            WHERE a."empresaId" = ${empresaId}
            GROUP BY a."motoristaId", ap.ano, ap.mes
          ) desconto ON desconto."motoristaId" = sal."motoristaId" AND desconto.mes = sal.mes

          UNION ALL

          -- Adiantamento: sai do caixa na data em que foi entregue.
          SELECT
            'adiantamento' AS tipo,
            a.data,
            NULL::text AS placa,
            m."nomeMotorista" AS motorista,
            NULL::text AS empresa,
            CONCAT(
              'Adiantamento de salário — desconto ',
              CASE
                WHEN p.qtd > 1 THEN CONCAT('em ', p.qtd, 'x (', TO_CHAR(p.inicio, 'MM/YYYY'), ' a ', TO_CHAR(p.fim, 'MM/YYYY'), ')')
                ELSE CONCAT('no salário ', TO_CHAR(p.inicio, 'MM/YYYY'))
              END,
              CASE WHEN a.observacao IS NOT NULL THEN CONCAT(' — ', a.observacao) ELSE '' END
            ) AS historico,
            a.valor::float8 AS despesas,
            NULL::numeric AS receitas,
            NULL::float8 AS "descontoAdiantamento"
          FROM "Adiantamento" a
          JOIN "Motorista" m ON m.id = a."motoristaId"
          CROSS JOIN LATERAL (
            SELECT COUNT(*) AS qtd, MIN(MAKE_DATE(ano, mes, 1)) AS inicio, MAX(MAKE_DATE(ano, mes, 1)) AS fim
            FROM "AdiantamentoParcela"
            WHERE "adiantamentoId" = a.id
          ) p
          WHERE ${incluirAdiantamentos}::boolean
            AND a."empresaId" = ${empresaId}
            AND a.data BETWEEN ${dataInicio}::date AND ${dataFim}::date
            AND (${motoristaId}::int IS NULL OR a."motoristaId" = ${motoristaId}::int)
            AND ${caminhaoId}::int IS NULL

          UNION ALL

          -- Parcela descontada do salário: só informativa (o valor já está
          -- abatido na linha do salário), por isso não tem despesa/receita.
          SELECT
            'desconto-adiantamento' AS tipo,
            MAKE_DATE(ap.ano, ap.mes, 1) AS data,
            NULL::text AS placa,
            m."nomeMotorista" AS motorista,
            NULL::text AS empresa,
            CONCAT(
              'Desconto do adiantamento de ', TO_CHAR(a.data, 'DD/MM/YYYY'),
              CASE
                WHEN (SELECT COUNT(*) FROM "AdiantamentoParcela" x WHERE x."adiantamentoId" = a.id) > 1
                THEN CONCAT(' (parcela ', ap.numero, '/', (SELECT COUNT(*) FROM "AdiantamentoParcela" x WHERE x."adiantamentoId" = a.id), ')')
                ELSE ''
              END,
              ' no salário ', TO_CHAR(MAKE_DATE(ap.ano, ap.mes, 1), 'MM/YYYY')
            ) AS historico,
            NULL::float8 AS despesas,
            NULL::numeric AS receitas,
            ap.valor::float8 AS "descontoAdiantamento"
          FROM "AdiantamentoParcela" ap
          JOIN "Adiantamento" a ON a.id = ap."adiantamentoId"
          JOIN "Motorista" m ON m.id = a."motoristaId"
          WHERE ${incluirAdiantamentos}::boolean
            AND a."empresaId" = ${empresaId}
            AND MAKE_DATE(ap.ano, ap.mes, 1) BETWEEN DATE_TRUNC('month', ${dataInicio}::date) AND ${dataFim}::date
            AND (${motoristaId}::int IS NULL OR a."motoristaId" = ${motoristaId}::int)
            AND ${caminhaoId}::int IS NULL
        ) extrato
        ORDER BY data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar extrato:', error);
      return { message: 'Erro ao buscar extrato!', error };
    }
  }
}
