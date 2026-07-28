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

  async create(createFazendaDto: CreateFazendaDto) {
    try {
      if (!createFazendaDto.nome) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const inserted = await this.sql`
        INSERT INTO "Fazenda" (nome, cidade_id)
        VALUES (${createFazendaDto.nome}, ${createFazendaDto.cidadeId ?? null})
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
          c.nome AS "nomeCidade",
          e.sigla AS "siglaEstado",
          COALESCE(fc.total, 0)::int AS "totalContatos"
        FROM "Fazenda" f
        LEFT JOIN "Cidade" c ON c.id = f.cidade_id
        LEFT JOIN "Estado" e ON e.id = c.estado_id
        LEFT JOIN (
          SELECT "fazendaId", COUNT(*) AS total FROM "FazendaContato" GROUP BY "fazendaId"
        ) fc ON fc."fazendaId" = f.id
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

  async findContatos(fazendaId: number) {
    try {
      const data = await this.sql`
        SELECT id, "fazendaId", contato
        FROM "FazendaContato"
        WHERE "fazendaId" = ${fazendaId}
        ORDER BY id ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar contatos da fazenda:', error);
      return { message: 'Erro ao buscar contatos da fazenda!', error: error };
    }
  }

  async addContato(fazendaId: number, dto: CreateFazendaContatoDto) {
    try {
      if (!dto.contato) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      const inserted = await this.sql`
        INSERT INTO "FazendaContato" ("fazendaId", contato)
        VALUES (${fazendaId}, ${dto.contato})
        RETURNING id
      `;
      return { message: 'Contato adicionado com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao adicionar contato da fazenda:', error);
      return { message: 'Erro ao adicionar contato da fazenda!', error: error };
    }
  }

  async removeContato(contatoId: number) {
    try {
      await this.sql`DELETE FROM "FazendaContato" WHERE id = ${contatoId}`;
      return { message: 'Contato removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover contato da fazenda:', error);
      return { message: 'Erro ao remover contato da fazenda!', error: error };
    }
  }
}
