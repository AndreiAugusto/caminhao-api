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

  async resumoMes(mes: number, ano: number) {
    try {
      const [fretes, manutencoes, abastecimentos] = await Promise.all([
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
            COALESCE(SUM(custo), 0) AS "custoManutencoes"
          FROM "Manutencao"
          WHERE EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
        this.sql`
          SELECT
            COUNT(*) AS "totalAbastecimentos",
            COALESCE(SUM("custoTotal"), 0) AS "custoAbastecimentos"
          FROM "Abastecimento"
          WHERE EXTRACT(MONTH FROM data) = ${mes}
            AND EXTRACT(YEAR FROM data) = ${ano}
        `,
      ]);

      const receitaBruta = Number(fretes[0].receitaBruta);
      const custoManutencoes = Number(manutencoes[0].custoManutencoes);
      const custoAbastecimentos = Number(abastecimentos[0].custoAbastecimentos);
      const saldoLiquido = receitaBruta - custoManutencoes - custoAbastecimentos;

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
        saldoLiquido,
      };
    } catch (error) {
      return { message: 'Erro ao buscar resumo do mês!', error };
    }
  }
}
