import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateFreteDto } from './dto/create-frete.dto';
import { UpdateFreteDto } from './dto/update-frete.dto';

@Injectable()
export class FreteService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(createFreteDto: CreateFreteDto) {
    try {
      if (!createFreteDto.valor || !createFreteDto.data || !createFreteDto.caminhaoId || !createFreteDto.motoristaId) {
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`
        INSERT INTO "Frete" (descricao, valor, data, "caminhaoId", "motoristaId", "porcentagemMotorista")
        VALUES (
          ${createFreteDto.descricao ?? null},
          ${createFreteDto.valor},
          ${createFreteDto.data},
          ${createFreteDto.caminhaoId},
          ${createFreteDto.motoristaId},
          ${createFreteDto.porcentagemMotorista ?? 30}
        )
      `;
      return { message: 'Frete registrado com sucesso!' };
    } catch (error) {
      console.error('Erro ao registrar frete:', error);
      return { message: 'Erro ao registrar frete!', error };
    }
  }

  async findAll() {
    try {
      const data = await this.sql`
        SELECT f.*, m."nomeMotorista", c.modelo AS "modeloCaminhao", c.placa
        FROM "Frete" f
        JOIN "Motorista" m ON m.id = f."motoristaId"
        JOIN "Caminhao" c ON c.id = f."caminhaoId"
        ORDER BY f.data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar fretes:', error);
      return { message: 'Erro ao buscar fretes!', error };
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.sql`
        SELECT f.*, m."nomeMotorista", c.modelo AS "modeloCaminhao", c.placa
        FROM "Frete" f
        JOIN "Motorista" m ON m.id = f."motoristaId"
        JOIN "Caminhao" c ON c.id = f."caminhaoId"
        WHERE f.id = ${id}
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar frete:', error);
      return { message: 'Erro ao buscar frete!', error };
    }
  }

  async update(id: number, updateFreteDto: UpdateFreteDto) {
    try {
      if (updateFreteDto.descricao !== undefined) {
        await this.sql`UPDATE "Frete" SET descricao = ${updateFreteDto.descricao} WHERE id = ${id}`;
      }
      if (updateFreteDto.valor !== undefined) {
        await this.sql`UPDATE "Frete" SET valor = ${updateFreteDto.valor} WHERE id = ${id}`;
      }
      if (updateFreteDto.data !== undefined) {
        await this.sql`UPDATE "Frete" SET data = ${updateFreteDto.data} WHERE id = ${id}`;
      }
      if (updateFreteDto.caminhaoId !== undefined) {
        await this.sql`UPDATE "Frete" SET "caminhaoId" = ${updateFreteDto.caminhaoId} WHERE id = ${id}`;
      }
      if (updateFreteDto.motoristaId !== undefined) {
        await this.sql`UPDATE "Frete" SET "motoristaId" = ${updateFreteDto.motoristaId} WHERE id = ${id}`;
      }
      if (updateFreteDto.porcentagemMotorista !== undefined) {
        await this.sql`UPDATE "Frete" SET "porcentagemMotorista" = ${updateFreteDto.porcentagemMotorista} WHERE id = ${id}`;
      }
      return { message: 'Frete atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar frete:', error);
      return { message: 'Erro ao atualizar frete!', error };
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Frete" WHERE id = ${id}`;
      return { message: 'Frete removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover frete:', error);
      return { message: 'Erro ao remover frete!', error };
    }
  }
}
