import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

@Injectable()
export class OficinaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, createOficinaDto: CreateOficinaDto) {
    try {
      const inserted = await this.sql`INSERT INTO "Oficina" ("nomeOficina", "empresaId") VALUES (${createOficinaDto.nomeOficina}, ${empresaId}) RETURNING id`;
      return { message: 'Oficina criada com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao criar oficina:', error);
      return { message: 'Erro ao criar oficina!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
        const data = await this.sql`Select * from "Oficina" WHERE "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
        return { message: 'Erro ao buscar oficinas!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
        const data = await this.sql`Select * from "Oficina" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
        return { message: 'Erro ao buscar oficinas!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateOficinaDto: UpdateOficinaDto) {
    try {
        if(updateOficinaDto.nomeOficina){
            await this.sql`UPDATE "Oficina" SET "nomeOficina" = ${updateOficinaDto.nomeOficina} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        return { message: 'Oficina atualizada com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar oficina:', error);
        return { message: 'Erro ao atualizar oficina!', error: error };            
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Oficina" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Oficina removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover oficina:', error);
      return { message: 'Erro ao remover oficina!', error: error };
    }
  }
}
