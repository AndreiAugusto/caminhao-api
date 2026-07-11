import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CidadeService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async findAll() {
    try {
      const data = await this.sql`
        SELECT c.*, e.nome AS "nomeEstado", e.sigla AS "siglaEstado"
        FROM "Cidade" c
        JOIN "Estado" e ON e.id = c.estado_id
        ORDER BY c.nome ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return { message: 'Erro ao buscar cidades!', error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`
        SELECT c.*, e.nome AS "nomeEstado", e.sigla AS "siglaEstado"
        FROM "Cidade" c
        JOIN "Estado" e ON e.id = c.estado_id
        WHERE c.id = ${id}
      `;
      return data[0] ?? null;
    } catch (error) {
      console.error('Erro ao buscar cidade:', error);
      return { message: 'Erro ao buscar cidade!', error };
    }
  }
}
