import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateCustoFixoDto } from './dto/create-custo-fixo.dto';
import { UpdateCustoFixoDto } from './dto/update-custo-fixo.dto';
import { UpsertAjusteCustoFixoDto } from './dto/upsert-ajuste-custo-fixo.dto';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';

@Injectable()
export class CustoFixoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, createCustoFixoDto: CreateCustoFixoDto) {
    try {
      if (!createCustoFixoDto.descricao || !createCustoFixoDto.valor || !createCustoFixoDto.diaVencimento || !createCustoFixoDto.dataInicio) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, createCustoFixoDto))) {
        return VINCULO_INVALIDO;
      }
      await this.sql`
        INSERT INTO "CustoFixo" (descricao, categoria, valor, "caminhaoId", "diaVencimento", "dataInicio", "dataFim", "empresaId")
        VALUES (
          ${createCustoFixoDto.descricao},
          ${createCustoFixoDto.categoria ?? null},
          ${createCustoFixoDto.valor},
          ${createCustoFixoDto.caminhaoId ?? null},
          ${createCustoFixoDto.diaVencimento},
          ${createCustoFixoDto.dataInicio},
          ${createCustoFixoDto.dataFim ?? null},
          ${empresaId}
        )
      `;
      return { message: 'Custo fixo criado com sucesso!' };
    } catch (error) {
      console.error('Erro ao criar custo fixo:', error);
      return { message: 'Erro ao criar custo fixo!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
      const data = await this.sql`
        SELECT
          cf.id,
          cf.descricao,
          cf.categoria,
          cf.valor,
          cf."caminhaoId",
          cf."diaVencimento",
          cf."dataInicio",
          cf."dataFim",
          c.placa AS "placaCaminhao",
          COALESCE(cfa.total, 0)::int AS "totalAjustes"
        FROM "CustoFixo" cf
        LEFT JOIN "Caminhao" c ON c.id = cf."caminhaoId"
        LEFT JOIN (
          SELECT "custoFixoId", COUNT(*) AS total FROM "CustoFixoAjuste" GROUP BY "custoFixoId"
        ) cfa ON cfa."custoFixoId" = cf.id
        WHERE cf."empresaId" = ${empresaId}
        ORDER BY cf."dataInicio" DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar custos fixos:', error);
      return { message: 'Erro ao buscar custos fixos!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
      const data = await this.sql`SELECT * FROM "CustoFixo" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar custo fixo:', error);
      return { message: 'Erro ao buscar custo fixo!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateCustoFixoDto: UpdateCustoFixoDto) {
    try {
      if (!(await vinculosDaEmpresa(this.sql, empresaId, updateCustoFixoDto))) {
        return VINCULO_INVALIDO;
      }
      if (updateCustoFixoDto.descricao) {
        await this.sql`UPDATE "CustoFixo" SET descricao = ${updateCustoFixoDto.descricao} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.categoria) {
        await this.sql`UPDATE "CustoFixo" SET categoria = ${updateCustoFixoDto.categoria} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.valor) {
        await this.sql`UPDATE "CustoFixo" SET valor = ${updateCustoFixoDto.valor} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.caminhaoId !== undefined) {
        await this.sql`UPDATE "CustoFixo" SET "caminhaoId" = ${updateCustoFixoDto.caminhaoId ?? null} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.diaVencimento) {
        await this.sql`UPDATE "CustoFixo" SET "diaVencimento" = ${updateCustoFixoDto.diaVencimento} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.dataInicio) {
        await this.sql`UPDATE "CustoFixo" SET "dataInicio" = ${updateCustoFixoDto.dataInicio} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateCustoFixoDto.dataFim !== undefined) {
        await this.sql`UPDATE "CustoFixo" SET "dataFim" = ${updateCustoFixoDto.dataFim ?? null} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }

      return { message: 'Custo fixo atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar custo fixo:', error);
      return { message: 'Erro ao atualizar custo fixo!', error: error };
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "CustoFixo" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Custo fixo removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover custo fixo:', error);
      return { message: 'Erro ao remover custo fixo!', error: error };
    }
  }

  async findAjustes(empresaId: number, custoFixoId: number) {
    try {
      const data = await this.sql`
        SELECT aj.id, aj."custoFixoId", aj.ano, aj.mes, aj.valor
        FROM "CustoFixoAjuste" aj
        JOIN "CustoFixo" cf ON cf.id = aj."custoFixoId"
        WHERE aj."custoFixoId" = ${custoFixoId} AND cf."empresaId" = ${empresaId}
        ORDER BY aj.ano DESC, aj.mes DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar ajustes do custo fixo:', error);
      return { message: 'Erro ao buscar ajustes do custo fixo!', error: error };
    }
  }

  async upsertAjuste(empresaId: number, custoFixoId: number, dto: UpsertAjusteCustoFixoDto) {
    try {
      if (!dto.ano || !dto.mes || dto.valor === undefined || dto.valor === null) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const salvo = await this.sql`
        INSERT INTO "CustoFixoAjuste" ("custoFixoId", ano, mes, valor)
        SELECT id, ${dto.ano}::int, ${dto.mes}::int, ${dto.valor}::numeric
        FROM "CustoFixo"
        WHERE id = ${custoFixoId} AND "empresaId" = ${empresaId}
        ON CONFLICT ("custoFixoId", ano, mes) DO UPDATE SET valor = EXCLUDED.valor
        RETURNING id
      `;
      if (salvo.length === 0) {
        return { message: 'Custo fixo não encontrado!', error: true };
      }
      return { message: 'Ajuste salvo com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar ajuste do custo fixo:', error);
      return { message: 'Erro ao salvar ajuste do custo fixo!', error: error };
    }
  }

  async removeAjuste(empresaId: number, ajusteId: number) {
    try {
      await this.sql`
        DELETE FROM "CustoFixoAjuste" aj
        USING "CustoFixo" cf
        WHERE aj.id = ${ajusteId} AND cf.id = aj."custoFixoId" AND cf."empresaId" = ${empresaId}
      `;
      return { message: 'Ajuste removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover ajuste do custo fixo:', error);
      return { message: 'Erro ao remover ajuste do custo fixo!', error: error };
    }
  }
}
