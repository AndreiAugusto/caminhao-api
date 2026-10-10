import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateAdiantamentoDto } from './dto/create-adiantamento.dto';
import { UpdateAdiantamentoDto } from './dto/update-adiantamento.dto';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';
import { NotaService } from '../nota/nota.service';

const MAXIMO_PARCELAS = 24;

type Parcelas = { numeros: number[]; meses: number[]; anos: number[]; valores: number[] };

@Injectable()
export class AdiantamentoService {
  private readonly sql;

  constructor(private configService: ConfigService, private notaService: NotaService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  /**
   * Divide o valor em parcelas iguais, uma por salário a partir de mesInicio/anoInicio
   * (a última absorve a diferença de centavos). Devolve uma mensagem se não der.
   */
  private gerarParcelas(valor: number, numeroParcelas: number, mesInicio: number, anoInicio: number): Parcelas | string {
    if (!Number.isInteger(numeroParcelas) || numeroParcelas < 1 || numeroParcelas > MAXIMO_PARCELAS) {
      return `O desconto deve ser feito em 1 a ${MAXIMO_PARCELAS} salários!`;
    }
    if (!Number.isInteger(mesInicio) || mesInicio < 1 || mesInicio > 12 || !Number.isInteger(anoInicio)) {
      return 'Informe o mês e o ano do primeiro desconto!';
    }
    const valorParcela = Math.round((valor / numeroParcelas) * 100) / 100;
    const parcelas: Parcelas = { numeros: [], meses: [], anos: [], valores: [] };
    for (let i = 0; i < numeroParcelas; i++) {
      const indiceMes = anoInicio * 12 + (mesInicio - 1) + i;
      const valorAtual = i < numeroParcelas - 1
        ? valorParcela
        : Math.round((valor - valorParcela * (numeroParcelas - 1)) * 100) / 100;
      if (valorAtual <= 0) return 'Valor pequeno demais para dividir em tantos salários!';
      parcelas.numeros.push(i + 1);
      parcelas.meses.push((indiceMes % 12) + 1);
      parcelas.anos.push(Math.floor(indiceMes / 12));
      parcelas.valores.push(valorAtual);
    }
    return parcelas;
  }

  async create(empresaId: number, dto: CreateAdiantamentoDto) {
    try {
      const valor = Number(dto.valor);
      if (!dto.motoristaId || !(valor > 0) || !dto.data) {
        return { message: 'Verifique os campos obrigatórios!', error: true };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, { motoristaId: dto.motoristaId }))) {
        return VINCULO_INVALIDO;
      }
      // Sem início informado, começa a descontar do salário do mês do adiantamento.
      const [ano, mes] = String(dto.data).slice(0, 10).split('-').map(Number);
      const parcelas = this.gerarParcelas(
        valor,
        Number(dto.numeroParcelas ?? 1),
        Number(dto.mesInicio ?? mes),
        Number(dto.anoInicio ?? ano),
      );
      if (typeof parcelas === 'string') return { message: parcelas, error: true };

      // Adiantamento e parcelas num único comando: ou grava tudo, ou nada.
      const inserted = await this.sql`
        WITH novo AS (
          INSERT INTO "Adiantamento" ("empresaId", "motoristaId", valor, data, observacao)
          VALUES (${empresaId}, ${dto.motoristaId}, ${valor}, ${dto.data}, ${dto.observacao || null})
          RETURNING id
        ), parcelas AS (
          INSERT INTO "AdiantamentoParcela" ("adiantamentoId", numero, mes, ano, valor)
          SELECT novo.id, p.numero, p.mes, p.ano, p.valor
          FROM novo, unnest(${parcelas.numeros}::int[], ${parcelas.meses}::int[], ${parcelas.anos}::int[], ${parcelas.valores}::numeric[])
            AS p(numero, mes, ano, valor)
        )
        SELECT id FROM novo
      `;
      return { message: 'Adiantamento registrado com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao registrar adiantamento:', error);
      return { message: 'Erro ao registrar adiantamento!', error };
    }
  }

  /**
   * Lista os adiantamentos (com as parcelas), opcionalmente de um motorista.
   * Com mês/ano, traz os feitos naquele mês E os que têm parcela descontada
   * do salário daquele mês, pra tela mostrar os dois lados.
   */
  async findAll(empresaId: number, filtros: { mes?: number; ano?: number; motoristaId?: number }) {
    try {
      const mes = filtros.mes ?? null;
      const ano = filtros.ano ?? null;
      const motoristaId = filtros.motoristaId ?? null;
      const data = await this.sql`
        SELECT
          a.id, a."motoristaId", a.valor::float8 AS valor, a.data, a.observacao,
          m."nomeMotorista",
          p.parcelas,
          (SELECT COUNT(*) FROM "Nota" n WHERE n."adiantamentoId" = a.id)::int AS "totalNotas"
        FROM "Adiantamento" a
        JOIN "Motorista" m ON m.id = a."motoristaId"
        CROSS JOIN LATERAL (
          SELECT COALESCE(
            json_agg(json_build_object('numero', ap.numero, 'mes', ap.mes, 'ano', ap.ano, 'valor', ap.valor::float8) ORDER BY ap.numero),
            '[]'::json
          ) AS parcelas
          FROM "AdiantamentoParcela" ap
          WHERE ap."adiantamentoId" = a.id
        ) p
        WHERE a."empresaId" = ${empresaId}
          AND (${motoristaId}::int IS NULL OR a."motoristaId" = ${motoristaId}::int)
          AND (
            ${mes}::int IS NULL OR ${ano}::int IS NULL
            OR (EXTRACT(MONTH FROM a.data) = ${mes}::int AND EXTRACT(YEAR FROM a.data) = ${ano}::int)
            OR EXISTS (
              SELECT 1 FROM "AdiantamentoParcela" ap
              WHERE ap."adiantamentoId" = a.id AND ap.mes = ${mes}::int AND ap.ano = ${ano}::int
            )
          )
        ORDER BY a.data DESC, a.id DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar adiantamentos:', error);
      return { message: 'Erro ao buscar adiantamentos!', error };
    }
  }

  async update(empresaId: number, id: number, dto: UpdateAdiantamentoDto) {
    try {
      const rows = await this.sql`
        SELECT
          a."motoristaId", a.valor::float8 AS valor, a.data::text AS data, a.observacao,
          (SELECT COUNT(*) FROM "AdiantamentoParcela" ap WHERE ap."adiantamentoId" = a.id)::int AS "numeroParcelas",
          (SELECT ap.mes FROM "AdiantamentoParcela" ap WHERE ap."adiantamentoId" = a.id ORDER BY ap.numero LIMIT 1) AS "mesInicio",
          (SELECT ap.ano FROM "AdiantamentoParcela" ap WHERE ap."adiantamentoId" = a.id ORDER BY ap.numero LIMIT 1) AS "anoInicio"
        FROM "Adiantamento" a
        WHERE a.id = ${id} AND a."empresaId" = ${empresaId}
      `;
      if (rows.length === 0) {
        return { message: 'Adiantamento não encontrado!', error: true };
      }
      const atual = rows[0];

      const motoristaId = dto.motoristaId ?? atual.motoristaId;
      const valor = Number(dto.valor ?? atual.valor);
      const data = dto.data ?? atual.data;
      const observacao = dto.observacao !== undefined ? dto.observacao || null : atual.observacao;
      if (!(valor > 0)) {
        return { message: 'O valor deve ser maior que zero!', error: true };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, { motoristaId }))) {
        return VINCULO_INVALIDO;
      }
      const parcelas = this.gerarParcelas(
        valor,
        Number(dto.numeroParcelas ?? atual.numeroParcelas ?? 1),
        Number(dto.mesInicio ?? atual.mesInicio),
        Number(dto.anoInicio ?? atual.anoInicio),
      );
      if (typeof parcelas === 'string') return { message: parcelas, error: true };

      // As parcelas são sempre refeitas a partir de valor/quantidade/início.
      await this.sql.transaction([
        this.sql`
          UPDATE "Adiantamento"
          SET "motoristaId" = ${motoristaId}, valor = ${valor}, data = ${data}, observacao = ${observacao}
          WHERE id = ${id} AND "empresaId" = ${empresaId}
        `,
        this.sql`DELETE FROM "AdiantamentoParcela" WHERE "adiantamentoId" = ${id}`,
        this.sql`
          INSERT INTO "AdiantamentoParcela" ("adiantamentoId", numero, mes, ano, valor)
          SELECT ${id}, p.numero, p.mes, p.ano, p.valor
          FROM unnest(${parcelas.numeros}::int[], ${parcelas.meses}::int[], ${parcelas.anos}::int[], ${parcelas.valores}::numeric[])
            AS p(numero, mes, ano, valor)
        `,
      ]);
      return { message: 'Adiantamento atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar adiantamento:', error);
      return { message: 'Erro ao atualizar adiantamento!', error };
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.notaService.removerArquivosDe(empresaId, { adiantamentoId: id });
      await this.sql`DELETE FROM "Adiantamento" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Adiantamento removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover adiantamento:', error);
      return { message: 'Erro ao remover adiantamento!', error };
    }
  }
}
