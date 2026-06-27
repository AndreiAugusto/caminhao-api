import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CargaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async findAll() {
    try {
      const data = await this.sql`SELECT * FROM "Carga" ORDER BY nome ASC`;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cargas:', error);
      return { message: 'Erro ao buscar cargas!', error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`SELECT * FROM "Carga" WHERE id = ${id}`;
      return data[0] ?? null;
    } catch (error) {
      console.error('Erro ao buscar carga:', error);
      return { message: 'Erro ao buscar carga!', error };
    }
  }
}
