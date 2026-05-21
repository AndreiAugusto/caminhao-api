import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateCaminhaoMotoristaDto } from './dto/create-caminhao-motorista.dto';
import { UpdateCaminhaoMotoristaDto } from './dto/update-caminhao-motorista.dto';

@Injectable()
export class CaminhaoMotoristaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  async create(createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    try {
      if(!createCaminhaoMotoristaDto.caminhaoId || !createCaminhaoMotoristaDto.motoristaId  || !createCaminhaoMotoristaDto.data){
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`INSERT INTO "Caminhao_Motorista" (data, "motoristaId", "caminhaoId") VALUES (${createCaminhaoMotoristaDto.data}, ${createCaminhaoMotoristaDto.motoristaId}, ${createCaminhaoMotoristaDto.caminhaoId})`;
      return { message: 'Caminhão-Motorista criado com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar caminhaoMotorista:', error);
      return { message: 'Erro ao criar caminhaoMotorista!', error: error };
    }
  }

  async findAll() {
    try {
        const data = await this.sql`Select * from "Caminhao_Motorista"`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhaoMotoristas:', error);
        return { message: 'Erro ao buscar caminhaoMotoristas!', error: error };
    }
  }

  async findOne(id: number) {
    try {
        const data = await this.sql`Select * from "Caminhao_Motorista" where id = ${id}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar caminhaoMotoristas:', error);
        return { message: 'Erro ao buscar caminhaoMotoristas!', error: error };
    }
  }

  async update(id: number, updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    try {
        if(updateCaminhaoMotoristaDto.data){
            await this.sql`UPDATE "Caminhao_Motorista" SET data = ${updateCaminhaoMotoristaDto.data} WHERE id = ${id}`;
        }
        if(updateCaminhaoMotoristaDto.motoristaId){
            await this.sql`UPDATE "Caminhao_Motorista" SET "motoristaId" = ${updateCaminhaoMotoristaDto.motoristaId} WHERE id = ${id}`;
        }
        if(updateCaminhaoMotoristaDto.caminhaoId){
            await this.sql`UPDATE "Caminhao_Motorista" SET "caminhaoId" = ${updateCaminhaoMotoristaDto.caminhaoId} WHERE id = ${id}`;
        }

        return { message: 'Caminhão-Motorista atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar caminhaoMotorista:', error);
        return { message: 'Erro ao atualizar caminhaoMotorista!', error: error };            
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Caminhao_Motorista" WHERE id = ${id}`;
      return { message: 'Caminhão-Motorista removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover caminhaoMotorista:', error);
      return { message: 'Erro ao remover caminhaoMotorista!', error: error };
    }
  }
}
