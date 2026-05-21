import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  async manutencaoCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao"`;
      return data[0].count;
    } catch (error) {
      console.error('Erro ao contar manutenções:', error);
      return { message: 'Erro ao contar manutenções!', error: error };
    }
  }

  async oficinaCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Oficina"`;
      return data[0].count;
    } catch (error) {
      console.error('Erro ao contar oficinas:', error);
      return { message: 'Erro ao contar oficinas!', error: error };
    }
  }

  async oficinaCountOne(id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "oficinaId" = ${id}`;
      return data[0].count;
    } catch (error) {
      console.error('Erro ao contar manutenções de oficina:', error);
      return { message: 'Erro ao contar manutenções de oficina!', error: error };
    }
  }

  async caminhaoCount() {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Caminhao"`;
      return data[0].count;
    } catch (error) {
      console.error('Erro ao contar caminhões:', error);
      return { message: 'Erro ao contar caminhões!', error: error };
    }
  }

  async caminhaoCountOne(id: number) {
    try {
      const data = await this.sql`SELECT COUNT(*) FROM "Manutencao" WHERE "caminhaoId" = ${id}`;
      return data[0].count;
    } catch (error) {
      console.error('Erro ao contar manutenções de caminhão:', error);
      return { message: 'Erro ao contar manutenções de caminhão!', error: error };
    }
  }
}
