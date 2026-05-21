import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';

@Injectable()
export class ManutencaoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  async create(createManutencaoDto: CreateManutencaoDto) {
    try {
      if(!createManutencaoDto.caminhaoId || !createManutencaoDto.oficinaId  || !createManutencaoDto.data){
        return { message: 'Verifique os campos obrigatórios!' };
      }
      await this.sql`INSERT INTO "Manutencao" (descricao, custo, data, "caminhaoId", "oficinaId") VALUES (${createManutencaoDto.descricao}, ${createManutencaoDto.custo}, ${createManutencaoDto.data}, ${createManutencaoDto.caminhaoId}, ${createManutencaoDto.oficinaId})`;
      return { message: 'Manutenção criada com sucesso!' }; 
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      return { message: 'Erro ao criar manutenção!', error: error };
    }
  }

  async findAll() {
    try {
        const data = await this.sql`Select * from "Manutencao"`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar manutenções:', error);
        return { message: 'Erro ao buscar manutenções!', error: error };
    }
  }

  async findOne(id: number) {
    try {
        const data = await this.sql`Select * from "Manutencao" where id = ${id}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar manutenções:', error);
        return { message: 'Erro ao buscar manutenções!', error: error };
    }
  }

  async update(id: number, updateManutencaoDto: UpdateManutencaoDto) {
    try {
        if(updateManutencaoDto.descricao){
            await this.sql`UPDATE "Manutencao" SET descricao = ${updateManutencaoDto.descricao} WHERE id = ${id}`;
        }
        if(updateManutencaoDto.custo){
            await this.sql`UPDATE "Manutencao" SET custo = ${updateManutencaoDto.custo} WHERE id = ${id}`;
        }
        if(updateManutencaoDto.data){
            await this.sql`UPDATE "Manutencao" SET data = ${updateManutencaoDto.data} WHERE id = ${id}`;
        }
        if(updateManutencaoDto.caminhaoId){
            await this.sql`UPDATE "Manutencao" SET "caminhaoId" = ${updateManutencaoDto.caminhaoId} WHERE id = ${id}`;
        }
        if(updateManutencaoDto.oficinaId){
            await this.sql`UPDATE "Manutencao" SET "oficinaId" = ${updateManutencaoDto.oficinaId} WHERE id = ${id}`;
        }

        return { message: 'Manutenção atualizada com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar manutenção:', error);
        return { message: 'Erro ao atualizar manutenção!', error: error };            
    }
  }

  async remove(id: number) {
    try {
      await this.sql`DELETE FROM "Manutencao" WHERE id = ${id}`;
      return { message: 'Manutenção removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover manutenção:', error);
      return { message: 'Erro ao remover manutenção!', error: error };
    }
  }
}
