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

  async create(createMotoristaDto: CreateMotoristaDto) {
    try {
      await this.sql`INSERT INTO "Motorista" ("nomeMotorista", nascimento, "nCarteira") VALUES (${createMotoristaDto.nomeMotorista}, ${createMotoristaDto.nascimento}, ${createMotoristaDto.nCarteira})`;
      return { message: 'Motorista criado com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      return { message: 'Erro ao criar motorista!', error: error };
    }
  }

  async findAll() {
    try {
        const data = await this.sql`Select * from "Motorista"`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return { message: 'Erro ao buscar motoristas!', error: error };
    }
  }

  async findOne(id: number) {
    try {
        const data = await this.sql`Select * from "Motorista" where id = ${id}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return { message: 'Erro ao buscar motoristas!', error: error };
    }
  }

  async update(id: number, updateMotoristaDto: UpdateMotoristaDto) {
    try {
        if(updateMotoristaDto.nomeMotorista){
            await this.sql`UPDATE "Motorista" SET "nomeMotorista" = ${updateMotoristaDto.nomeMotorista} WHERE id = ${id}`;
        }
        if(updateMotoristaDto.nascimento){
            await this.sql`UPDATE "Motorista" SET nascimento = ${updateMotoristaDto.nascimento} WHERE id = ${id}`;
        }
        if(updateMotoristaDto.nCarteira){
            await this.sql`UPDATE "Motorista" SET "nCarteira" = ${updateMotoristaDto.nCarteira} WHERE id = ${id}`;
        }
        return { message: 'Motorista atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar motorista:', error);
        return { message: 'Erro ao atualizar motorista!', error: error };            
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Motorista" WHERE id = ${id}`;
      return { message: 'Motorista removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover motorista:', error);
      return { message: 'Erro ao remover motorista!', error: error };
    }
  }
}
