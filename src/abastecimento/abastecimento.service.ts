import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';
import { UpdateAbastecimentoDto } from './dto/update-abastecimento.dto';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';

@Injectable()
export class AbastecimentoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, createAbastecimentoDto: CreateAbastecimentoDto) {
    try {
      if (!createAbastecimentoDto.custoTotal || !createAbastecimentoDto.data || !createAbastecimentoDto.caminhaoId) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, createAbastecimentoDto))) {
        return VINCULO_INVALIDO;
      }
      await this.sql`
        INSERT INTO "Abastecimento" (litros, "custoTotal", data, "caminhaoId", quilometragem, "empresaId")
        VALUES (
          ${createAbastecimentoDto.litros ?? null},
          ${createAbastecimentoDto.custoTotal},
          ${createAbastecimentoDto.data},
          ${createAbastecimentoDto.caminhaoId},
          ${createAbastecimentoDto.quilometragem ?? null},
          ${empresaId}
        )
      `;
      return { message: 'Abastecimento registrado com sucesso!' };
    } catch (error) {
      console.error('Erro ao registrar abastecimento:', error);
      return { message: 'Erro ao registrar abastecimento!', error };
    }
  }

  async findAll(empresaId: number) {
    try {
      const data = await this.sql`
        SELECT a.*, c.modelo AS "modeloCaminhao", c.placa
        FROM "Abastecimento" a
        JOIN "Caminhao" c ON c.id = a."caminhaoId"
        WHERE a."empresaId" = ${empresaId}
        ORDER BY a.data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar abastecimentos:', error);
      return { message: 'Erro ao buscar abastecimentos!', error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
      const data = await this.sql`
        SELECT a.*, c.modelo AS "modeloCaminhao", c.placa
        FROM "Abastecimento" a
        JOIN "Caminhao" c ON c.id = a."caminhaoId"
        WHERE a.id = ${id} AND a."empresaId" = ${empresaId}
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar abastecimento:', error);
      return { message: 'Erro ao buscar abastecimento!', error };
    }
  }

  async update(empresaId: number, id: number, updateAbastecimentoDto: UpdateAbastecimentoDto) {
    try {
      if (!(await vinculosDaEmpresa(this.sql, empresaId, updateAbastecimentoDto))) {
        return VINCULO_INVALIDO;
      }
      if (updateAbastecimentoDto.litros !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET litros = ${updateAbastecimentoDto.litros} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateAbastecimentoDto.custoTotal !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET "custoTotal" = ${updateAbastecimentoDto.custoTotal} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateAbastecimentoDto.data !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET data = ${updateAbastecimentoDto.data} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateAbastecimentoDto.caminhaoId !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET "caminhaoId" = ${updateAbastecimentoDto.caminhaoId} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateAbastecimentoDto.quilometragem !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET quilometragem = ${updateAbastecimentoDto.quilometragem} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      return { message: 'Abastecimento atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar abastecimento:', error);
      return { message: 'Erro ao atualizar abastecimento!', error };
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Abastecimento" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Abastecimento removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover abastecimento:', error);
      return { message: 'Erro ao remover abastecimento!', error };
    }
  }
}
