import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';

@Injectable()
export class MotoristaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, createMotoristaDto: CreateMotoristaDto) {
    try {
      await this.sql`INSERT INTO "Motorista" ("nomeMotorista", nascimento, "nCarteira", "empresaId") VALUES (${createMotoristaDto.nomeMotorista}, ${createMotoristaDto.nascimento}, ${createMotoristaDto.nCarteira}, ${empresaId})`;
      return { message: 'Motorista criado com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      return { message: 'Erro ao criar motorista!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
        const data = await this.sql`Select * from "Motorista" WHERE "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return { message: 'Erro ao buscar motoristas!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
        const data = await this.sql`Select * from "Motorista" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return { message: 'Erro ao buscar motoristas!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateMotoristaDto: UpdateMotoristaDto) {
    try {
        if(updateMotoristaDto.nomeMotorista){
            await this.sql`UPDATE "Motorista" SET "nomeMotorista" = ${updateMotoristaDto.nomeMotorista} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateMotoristaDto.nascimento){
            await this.sql`UPDATE "Motorista" SET nascimento = ${updateMotoristaDto.nascimento} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateMotoristaDto.nCarteira){
            await this.sql`UPDATE "Motorista" SET "nCarteira" = ${updateMotoristaDto.nCarteira} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        return { message: 'Motorista atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar motorista:', error);
        return { message: 'Erro ao atualizar motorista!', error: error };            
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Motorista" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Motorista removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover motorista:', error);
      return { message: 'Erro ao remover motorista!', error: error };
    }
  }
}
