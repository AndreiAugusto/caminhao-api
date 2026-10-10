import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateCaminhaoMotoristaDto } from './dto/create-caminhao-motorista.dto';
import { UpdateCaminhaoMotoristaDto } from './dto/update-caminhao-motorista.dto';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';

@Injectable()
export class CaminhaoMotoristaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  async create(empresaId: number, createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    try {
      if(!createCaminhaoMotoristaDto.caminhaoId || !createCaminhaoMotoristaDto.motoristaId  || !createCaminhaoMotoristaDto.data){
        return { message: 'Verifique os campos obrigatórios!' };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, createCaminhaoMotoristaDto))) {
        return VINCULO_INVALIDO;
      }
      await this.sql`INSERT INTO "Caminhao_Motorista" (data, "motoristaId", "caminhaoId", "empresaId") VALUES (${createCaminhaoMotoristaDto.data}, ${createCaminhaoMotoristaDto.motoristaId}, ${createCaminhaoMotoristaDto.caminhaoId}, ${empresaId})`;
      return { message: 'Caminhão-Motorista criado com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar caminhaoMotorista:', error);
      return { message: 'Erro ao criar caminhaoMotorista!', error: error };
    }
  }

  async findAll(empresaId: number) {
    try {
        const data = await this.sql`Select * from "Caminhao_Motorista" WHERE "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhaoMotoristas:', error);
        return { message: 'Erro ao buscar caminhaoMotoristas!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
        const data = await this.sql`Select * from "Caminhao_Motorista" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhaoMotoristas:', error);
        return { message: 'Erro ao buscar caminhaoMotoristas!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    try {
        if (!(await vinculosDaEmpresa(this.sql, empresaId, updateCaminhaoMotoristaDto))) {
          return VINCULO_INVALIDO;
        }
        if(updateCaminhaoMotoristaDto.data){
            await this.sql`UPDATE "Caminhao_Motorista" SET data = ${updateCaminhaoMotoristaDto.data} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateCaminhaoMotoristaDto.motoristaId){
            await this.sql`UPDATE "Caminhao_Motorista" SET "motoristaId" = ${updateCaminhaoMotoristaDto.motoristaId} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateCaminhaoMotoristaDto.caminhaoId){
            await this.sql`UPDATE "Caminhao_Motorista" SET "caminhaoId" = ${updateCaminhaoMotoristaDto.caminhaoId} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }

        return { message: 'Caminhão-Motorista atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar caminhaoMotorista:', error);
        return { message: 'Erro ao atualizar caminhaoMotorista!', error: error };            
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.sql`DELETE FROM "Caminhao_Motorista" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Caminhão-Motorista removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover caminhaoMotorista:', error);
      return { message: 'Erro ao remover caminhaoMotorista!', error: error };
    }
  }
}
