import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateCustoFixoDto } from './dto/create-custo-fixo.dto';
import { UpdateCustoFixoDto } from './dto/update-custo-fixo.dto';
import { UpsertAjusteCustoFixoDto } from './dto/upsert-ajuste-custo-fixo.dto';

@Injectable()
export class CustoFixoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(createCustoFixoDto: CreateCustoFixoDto) {
    try {
      if (!createCustoFixoDto.descricao || !createCustoFixoDto.valor || !createCustoFixoDto.diaVencimento || !createCustoFixoDto.dataInicio) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`
        INSERT INTO "CustoFixo" (descricao, categoria, valor, "caminhaoId", "diaVencimento", "dataInicio", "dataFim")
        VALUES (
          ${createCustoFixoDto.descricao},
          ${createCustoFixoDto.categoria ?? null},
          ${createCustoFixoDto.valor},
          ${createCustoFixoDto.caminhaoId ?? null},
          ${createCustoFixoDto.diaVencimento},
          ${createCustoFixoDto.dataInicio},
          ${createCustoFixoDto.dataFim ?? null}
        )
      `;
      return { message: 'Custo fixo criado com sucesso!' };
    } catch (error) {
      console.error('Erro ao criar custo fixo:', error);
      return { message: 'Erro ao criar custo fixo!', error: error };
    }
  }

  async findAll() {
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
          c.placa AS "placaCaminhao"
        FROM "CustoFixo" cf
        LEFT JOIN "Caminhao" c ON c.id = cf."caminhaoId"
        ORDER BY cf."dataInicio" DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar custos fixos:', error);
      return { message: 'Erro ao buscar custos fixos!', error: error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`SELECT * FROM "CustoFixo" WHERE id = ${id}`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar custo fixo:', error);
      return { message: 'Erro ao buscar custo fixo!', error: error };
    }
  }

  async update(id: number, updateCustoFixoDto: UpdateCustoFixoDto) {
    try {
      if (updateCustoFixoDto.descricao) {
        await this.sql`UPDATE "CustoFixo" SET descricao = ${updateCustoFixoDto.descricao} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.categoria) {
        await this.sql`UPDATE "CustoFixo" SET categoria = ${updateCustoFixoDto.categoria} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.valor) {
        await this.sql`UPDATE "CustoFixo" SET valor = ${updateCustoFixoDto.valor} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.caminhaoId !== undefined) {
        await this.sql`UPDATE "CustoFixo" SET "caminhaoId" = ${updateCustoFixoDto.caminhaoId ?? null} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.diaVencimento) {
        await this.sql`UPDATE "CustoFixo" SET "diaVencimento" = ${updateCustoFixoDto.diaVencimento} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.dataInicio) {
        await this.sql`UPDATE "CustoFixo" SET "dataInicio" = ${updateCustoFixoDto.dataInicio} WHERE id = ${id}`;
      }
      if (updateCustoFixoDto.dataFim !== undefined) {
        await this.sql`UPDATE "CustoFixo" SET "dataFim" = ${updateCustoFixoDto.dataFim ?? null} WHERE id = ${id}`;
      }

      return { message: 'Custo fixo atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar custo fixo:', error);
      return { message: 'Erro ao atualizar custo fixo!', error: error };
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "CustoFixo" WHERE id = ${id}`;
      return { message: 'Custo fixo removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover custo fixo:', error);
      return { message: 'Erro ao remover custo fixo!', error: error };
    }
  }

  async findAjustes(custoFixoId: number) {
    try {
      const data = await this.sql`
        SELECT id, "custoFixoId", ano, mes, valor
        FROM "CustoFixoAjuste"
        WHERE "custoFixoId" = ${custoFixoId}
        ORDER BY ano DESC, mes DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar ajustes do custo fixo:', error);
      return { message: 'Erro ao buscar ajustes do custo fixo!', error: error };
    }
  }

  async upsertAjuste(custoFixoId: number, dto: UpsertAjusteCustoFixoDto) {
    try {
      if (!dto.ano || !dto.mes || dto.valor === undefined || dto.valor === null) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`
        INSERT INTO "CustoFixoAjuste" ("custoFixoId", ano, mes, valor)
        VALUES (${custoFixoId}, ${dto.ano}, ${dto.mes}, ${dto.valor})
        ON CONFLICT ("custoFixoId", ano, mes) DO UPDATE SET valor = EXCLUDED.valor
      `;
      return { message: 'Ajuste salvo com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar ajuste do custo fixo:', error);
      return { message: 'Erro ao salvar ajuste do custo fixo!', error: error };
    }
  }

  async removeAjuste(ajusteId: number) {
    try {
      await this.sql`DELETE FROM "CustoFixoAjuste" WHERE id = ${ajusteId}`;
      return { message: 'Ajuste removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover ajuste do custo fixo:', error);
      return { message: 'Erro ao remover ajuste do custo fixo!', error: error };
    }
  }
}
