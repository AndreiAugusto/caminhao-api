import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';

@Injectable()
export class FazendaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(createFazendaDto: CreateFazendaDto) {
    try {
      if (!createFazendaDto.nome) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const inserted = await this.sql`
        INSERT INTO "Fazenda" (nome, cidade_id, contato)
        VALUES (${createFazendaDto.nome}, ${createFazendaDto.cidadeId ?? null}, ${createFazendaDto.contato ?? null})
        RETURNING id
      `;
      return { message: 'Fazenda criada com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao criar fazenda:', error);
      return { message: 'Erro ao criar fazenda!', error: error };
    }
  }

  async findAll() {
    try {
      const data = await this.sql`
        SELECT
          f.id,
          f.nome,
          f.cidade_id,
          f.contato,
          c.nome AS "nomeCidade",
          e.sigla AS "siglaEstado"
        FROM "Fazenda" f
        LEFT JOIN "Cidade" c ON c.id = f.cidade_id
        LEFT JOIN "Estado" e ON e.id = c.estado_id
        ORDER BY f.nome ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fazendas:', error);
      return { message: 'Erro ao buscar fazendas!', error: error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`SELECT * FROM "Fazenda" WHERE id = ${id}`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fazenda:', error);
      return { message: 'Erro ao buscar fazenda!', error: error };
    }
  }

  async update(id: number, updateFazendaDto: UpdateFazendaDto) {
    try {
      if (updateFazendaDto.nome) {
        await this.sql`UPDATE "Fazenda" SET nome = ${updateFazendaDto.nome} WHERE id = ${id}`;
      }
      if (updateFazendaDto.cidadeId !== undefined) {
        await this.sql`UPDATE "Fazenda" SET cidade_id = ${updateFazendaDto.cidadeId ?? null} WHERE id = ${id}`;
      }
      if (updateFazendaDto.contato !== undefined) {
        await this.sql`UPDATE "Fazenda" SET contato = ${updateFazendaDto.contato ?? null} WHERE id = ${id}`;
      }
      return { message: 'Fazenda atualizada com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar fazenda:', error);
      return { message: 'Erro ao atualizar fazenda!', error: error };
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Fazenda" WHERE id = ${id}`;
      return { message: 'Fazenda removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover fazenda:', error);
      return { message: 'Erro ao remover fazenda!', error: error };
    }
  }
}
