import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';
import { CreateFazendaContatoDto } from './dto/create-fazenda-contato.dto';

@Injectable()
export class FazendaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, createFazendaDto: CreateFazendaDto) {
    try {
      if (!createFazendaDto.nome) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const inserted = await this.sql`
        INSERT INTO "Fazenda" (nome, cidade_id, "empresaId")
        VALUES (${createFazendaDto.nome}, ${createFazendaDto.cidadeId ?? null}, ${empresaId})
        RETURNING id
      `;
      return { message: 'Fazenda criada com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao criar fazenda:', error);
      return { message: 'Erro ao criar fazenda!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
      const data = await this.sql`
        SELECT
          f.id,
          f.nome,
          f.cidade_id,
          c.nome AS "nomeCidade",
          e.sigla AS "siglaEstado",
          COALESCE(fc.total, 0)::int AS "totalContatos"
        FROM "Fazenda" f
        LEFT JOIN "Cidade" c ON c.id = f.cidade_id
        LEFT JOIN "Estado" e ON e.id = c.estado_id
        LEFT JOIN (
          SELECT "fazendaId", COUNT(*) AS total FROM "FazendaContato" GROUP BY "fazendaId"
        ) fc ON fc."fazendaId" = f.id
        WHERE f."empresaId" = ${empresaId}
        ORDER BY f.nome ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fazendas:', error);
      return { message: 'Erro ao buscar fazendas!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
      const data = await this.sql`SELECT * FROM "Fazenda" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fazenda:', error);
      return { message: 'Erro ao buscar fazenda!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateFazendaDto: UpdateFazendaDto) {
    try {
      if (updateFazendaDto.nome) {
        await this.sql`UPDATE "Fazenda" SET nome = ${updateFazendaDto.nome} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (updateFazendaDto.cidadeId !== undefined) {
        await this.sql`UPDATE "Fazenda" SET cidade_id = ${updateFazendaDto.cidadeId ?? null} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      return { message: 'Fazenda atualizada com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar fazenda:', error);
      return { message: 'Erro ao atualizar fazenda!', error: error };
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Fazenda" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Fazenda removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover fazenda:', error);
      return { message: 'Erro ao remover fazenda!', error: error };
    }
  }

  async findContatos(empresaId: number, fazendaId: number) {
    try {
      const data = await this.sql`
        SELECT fc.id, fc."fazendaId", fc.contato
        FROM "FazendaContato" fc
        JOIN "Fazenda" f ON f.id = fc."fazendaId"
        WHERE fc."fazendaId" = ${fazendaId} AND f."empresaId" = ${empresaId}
        ORDER BY fc.id ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar contatos da fazenda:', error);
      return { message: 'Erro ao buscar contatos da fazenda!', error: error };
    }
  }

  async addContato(empresaId: number, fazendaId: number, dto: CreateFazendaContatoDto) {
    try {
      if (!dto.contato) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const inserted = await this.sql`
        INSERT INTO "FazendaContato" ("fazendaId", contato)
        SELECT id, ${dto.contato}::text
        FROM "Fazenda"
        WHERE id = ${fazendaId} AND "empresaId" = ${empresaId}
        RETURNING id
      `;
      if (inserted.length === 0) {
        return { message: 'Fazenda não encontrada!', error: true };
      }
      return { message: 'Contato adicionado com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao adicionar contato da fazenda:', error);
      return { message: 'Erro ao adicionar contato da fazenda!', error: error };
    }
  }

  async removeContato(empresaId: number, contatoId: number) {
    try {
      await this.sql`
        DELETE FROM "FazendaContato" fc
        USING "Fazenda" f
        WHERE fc.id = ${contatoId} AND f.id = fc."fazendaId" AND f."empresaId" = ${empresaId}
      `;
      return { message: 'Contato removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover contato da fazenda:', error);
      return { message: 'Erro ao remover contato da fazenda!', error: error };
    }
  }
}
