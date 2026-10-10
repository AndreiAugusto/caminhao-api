import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateCaminhaoDto } from './dto/create-caminhao.dto';
import { UpdateCaminhaoDto } from './dto/update-caminhao.dto';

@Injectable()
export class CaminhaoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  async create(empresaId: number, createCaminhaoDto: CreateCaminhaoDto) {
    try {
      await this.sql`INSERT INTO "Caminhao" (modelo, ano, placa, "empresaId") VALUES (${createCaminhaoDto.modelo}, ${createCaminhaoDto.ano}, ${createCaminhaoDto.placa}, ${empresaId})`;
      return { message: 'Caminhão criado com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar caminhão:', error);
      return { message: 'Erro ao criar caminhão!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
        const data = await this.sql`Select * from "Caminhao" WHERE "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhões:', error);
        return { message: 'Erro ao buscar caminhões!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
        const data = await this.sql`Select * from "Caminhao" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhões:', error);
        return { message: 'Erro ao buscar caminhões!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateCaminhaoDto: UpdateCaminhaoDto) {
    try {
        if(updateCaminhaoDto.modelo){
            await this.sql`UPDATE "Caminhao" SET modelo = ${updateCaminhaoDto.modelo} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateCaminhaoDto.ano){
            await this.sql`UPDATE "Caminhao" SET ano = ${updateCaminhaoDto.ano} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateCaminhaoDto.placa){
            await this.sql`UPDATE "Caminhao" SET placa = ${updateCaminhaoDto.placa} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        return { message: 'Caminhão atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar caminhão:', error);
        return { message: 'Erro ao atualizar caminhão!', error: error };            
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Caminhao" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Caminhão removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover caminhão:', error);
      return { message: 'Erro ao remover caminhão!', error: error };
    }
  }
}
