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

  async create(createOficinaDto: CreateOficinaDto) {
    try {
      await this.sql`INSERT INTO "Oficina" ("nomeOficina") VALUES (${createOficinaDto.nomeOficina})`;
      return { message: 'Oficina criada com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar oficina:', error);
      return { message: 'Erro ao criar oficina!', error: error };
    }
  }

  async findAll() {
    try {
        const data = await this.sql`Select * from "Oficina"`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
        return { message: 'Erro ao buscar oficinas!', error: error };
    }
  }

  async findOne(id: number) {
    try {
        const data = await this.sql`Select * from "Oficina" where id = ${id}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar oficinas:', error);
        return { message: 'Erro ao buscar oficinas!', error: error };
    }
  }

  async update(id: number, updateOficinaDto: UpdateOficinaDto) {
    try {
        if(updateOficinaDto.nomeOficina){
            await this.sql`UPDATE "Oficina" SET "nomeOficina" = ${updateOficinaDto.nomeOficina} WHERE id = ${id}`;
        }
        return { message: 'Oficina atualizada com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar oficina:', error);
        return { message: 'Erro ao atualizar oficina!', error: error };            
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Oficina" WHERE id = ${id}`;
      return { message: 'Oficina removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover oficina:', error);
      return { message: 'Erro ao remover oficina!', error: error };
    }
  }
}
