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

  async manutencaoCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao"`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções!', error };
    }
  }

  async oficinaCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Oficina"`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar oficinas!', error };
    }
  }

  async oficinaCountOne(id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "oficinaId" = ${id}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções de oficina!', error };
    }
  }

  async caminhaoCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Caminhao"`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar caminhões!', error };
    }
  }

  async caminhaoCountOne(id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "caminhaoId" = ${id}`;
      return data[0].count;
    } catch (error) {
      return { message: 'Erro ao contar manutenções de caminhão!', error };
    }
  }

  async motoristaPagamento(id: number, mes: number, ano: number) {
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
        WHERE m.id = ${id}
        GROUP BY m.id, m."nomeMotorista"
      `;
      return data[0] ?? null;
    } catch (error) {
      return { message: 'Erro ao calcular pagamento do motorista!', error };
    }
  }

  async salariosMes(mes: number, ano: number) {
    try {
      const data = await this.sql`
        SELECT
          m.id AS "motoristaId",
          m."nomeMotorista",
          COUNT(f.id) AS "totalFretes",
          COALESCE(SUM(f.valor), 0) AS "totalFretesBruto",
          COALESCE(SUM(f.valor * f."porcentagemMotorista" / 100), 0) AS "totalReceber"
        FROM "Motorista" m
        LEFT JOIN "Frete" f
          ON f."motoristaId" = m.id
          AND EXTRACT(MONTH FROM f.data) = ${mes}
          AND EXTRACT(YEAR FROM f.data) = ${ano}
        GROUP BY m.id, m."nomeMotorista"
        ORDER BY m."nomeMotorista"
      `;
      return data;
    } catch (error) {
      return { message: 'Erro ao calcular salários do mês!', error };
    }
  }

  async ultimasMovimentacoes(limite: number) {
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
        ) movimentacoes
        ORDER BY data DESC
        LIMIT ${limite}
      `;
      return data;
    } catch (error) {
      return { message: 'Erro ao buscar últimas movimentações!', error };
    }
  }

  async resumoMes(mes: number, ano: number) {
    try {
      const [fretes, manutencoes, abastecimentos, custosFixos, salarios] = await Promise.all([
        this.sql`
          SELECT
            COUNT(*) AS "totalFretes",
            COALESCE(SUM(valor), 0) AS "receitaBruta"
          FROM "Frete"
          WHERE EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalManutencoes",
            COALESCE(SUM(mp.valor), 0) AS "custoManutencoes"
          FROM "ManutencaoParcela" mp
          WHERE EXTRACT(MONTH FROM mp."dataVencimento") = ${mes}
            AND EXTRACT(YEAR FROM mp."dataVencimento") = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalAbastecimentos",
            COALESCE(SUM("custoTotal"), 0) AS "custoAbastecimentos"
          FROM "Abastecimento"
          WHERE EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalCustosFixos",
            COALESCE(SUM(COALESCE(aj.valor, cf.valor)), 0) AS "custoFixo"
          FROM "CustoFixo" cf
          LEFT JOIN "CustoFixoAjuste" aj ON aj."custoFixoId" = cf.id AND aj.ano = ${ano} AND aj.mes = ${mes}
          WHERE cf."dataInicio" <= (DATE_TRUNC('month', MAKE_DATE(${ano}, ${mes}, 1)) + INTERVAL '1 month - 1 day')
            AND (cf."dataFim" IS NULL OR cf."dataFim" >= DATE_TRUNC('month', MAKE_DATE(${ano}, ${mes}, 1)))
        `,
        this.sql`
          SELECT COALESCE(SUM(valor * "porcentagemMotorista" / 100), 0) AS "custoSalarios"
          FROM "Frete"
          WHERE EXTRACT(MONTH FROM data) = ${mes}
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

  async extrato(filtros: {
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
            f.valor AS receitas
          FROM "Frete" f
          JOIN "Caminhao" c ON c.id = f."caminhaoId"
          JOIN "Motorista" m ON m.id = f."motoristaId"
          LEFT JOIN "Fazenda" fz ON fz.id = f."fazendaId"
          WHERE ${incluirFrete}::boolean
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
            NULL::numeric AS receitas
          FROM "Abastecimento" a
          JOIN "Caminhao" c ON c.id = a."caminhaoId"
          WHERE ${incluirAbastecimento}::boolean
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
            NULL::numeric AS receitas
          FROM "ManutencaoParcela" mp
          JOIN "Manutencao" m ON m.id = mp."manutencaoId"
          JOIN "Caminhao" c ON c.id = m."caminhaoId"
          JOIN "Oficina" o ON o.id = m."oficinaId"
          WHERE ${incluirManutencao}::boolean
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
            NULL::numeric AS receitas
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
            AND (${caminhaoId}::int IS NULL OR cf."caminhaoId" = ${caminhaoId}::int)
            AND ${motoristaId}::int IS NULL

          UNION ALL

          SELECT
            'salario-motorista' AS tipo,
            (DATE_TRUNC('month', f.data))::date AS data,
            NULL::text AS placa,
            m."nomeMotorista" AS motorista,
            NULL::text AS empresa,
            CONCAT('Salário ', TO_CHAR(DATE_TRUNC('month', f.data), 'MM/YYYY')) AS historico,
            SUM(f.valor * f."porcentagemMotorista" / 100) AS despesas,
            NULL::numeric AS receitas
          FROM "Frete" f
          JOIN "Motorista" m ON m.id = f."motoristaId"
          WHERE ${incluirSalarios}::boolean
            AND f.data BETWEEN ${dataInicio}::date AND ${dataFim}::date
            AND (${motoristaId}::int IS NULL OR f."motoristaId" = ${motoristaId}::int)
            AND ${caminhaoId}::int IS NULL
          GROUP BY DATE_TRUNC('month', f.data), m.id, m."nomeMotorista"
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
