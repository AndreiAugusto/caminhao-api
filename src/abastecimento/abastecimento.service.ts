import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';
import { UpdateAbastecimentoDto } from './dto/update-abastecimento.dto';

@Injectable()
export class AbastecimentoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(createAbastecimentoDto: CreateAbastecimentoDto) {
    try {
      if (!createAbastecimentoDto.custoTotal || !createAbastecimentoDto.data || !createAbastecimentoDto.caminhaoId) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`
        INSERT INTO "Abastecimento" (litros, "custoTotal", data, "caminhaoId", quilometragem)
        VALUES (
          ${createAbastecimentoDto.litros ?? null},
          ${createAbastecimentoDto.custoTotal},
          ${createAbastecimentoDto.data},
          ${createAbastecimentoDto.caminhaoId},
          ${createAbastecimentoDto.quilometragem ?? null}
        )
      `;
      return { message: 'Abastecimento registrado com sucesso!' };
    } catch (error) {
      console.error('Erro ao registrar abastecimento:', error);
      return { message: 'Erro ao registrar abastecimento!', error };
    }
  }

  async findAll() {
    try {
      const data = await this.sql`
        SELECT a.*, c.modelo AS "modeloCaminhao", c.placa
        FROM "Abastecimento" a
        JOIN "Caminhao" c ON c.id = a."caminhaoId"
        ORDER BY a.data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar abastecimentos:', error);
      return { message: 'Erro ao buscar abastecimentos!', error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`
        SELECT a.*, c.modelo AS "modeloCaminhao", c.placa
        FROM "Abastecimento" a
        JOIN "Caminhao" c ON c.id = a."caminhaoId"
        WHERE a.id = ${id}
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar abastecimento:', error);
      return { message: 'Erro ao buscar abastecimento!', error };
    }
  }

  async update(id: number, updateAbastecimentoDto: UpdateAbastecimentoDto) {
    try {
      if (updateAbastecimentoDto.litros !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET litros = ${updateAbastecimentoDto.litros} WHERE id = ${id}`;
      }
      if (updateAbastecimentoDto.custoTotal !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET "custoTotal" = ${updateAbastecimentoDto.custoTotal} WHERE id = ${id}`;
      }
      if (updateAbastecimentoDto.data !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET data = ${updateAbastecimentoDto.data} WHERE id = ${id}`;
      }
      if (updateAbastecimentoDto.caminhaoId !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET "caminhaoId" = ${updateAbastecimentoDto.caminhaoId} WHERE id = ${id}`;
      }
      if (updateAbastecimentoDto.quilometragem !== undefined) {
        await this.sql`UPDATE "Abastecimento" SET quilometragem = ${updateAbastecimentoDto.quilometragem} WHERE id = ${id}`;
      }
      return { message: 'Abastecimento atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar abastecimento:', error);
      return { message: 'Erro ao atualizar abastecimento!', error };
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Abastecimento" WHERE id = ${id}`;
      return { message: 'Abastecimento removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover abastecimento:', error);
      return { message: 'Erro ao remover abastecimento!', error };
    }
  }
}
