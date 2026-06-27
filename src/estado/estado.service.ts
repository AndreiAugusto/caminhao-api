import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EstadoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async findAll() {
    try {
      const data = await this.sql`SELECT * FROM "Estado" ORDER BY nome ASC`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      return { message: 'Erro ao buscar estados!', error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`SELECT * FROM "Estado" WHERE id = ${id}`;
      return data[0] ?? null;
    } catch (error) {
      console.error('Erro ao buscar estado:', error);
      return { message: 'Erro ao buscar estado!', error };
    }
  }
}
