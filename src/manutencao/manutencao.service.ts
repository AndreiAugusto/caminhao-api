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
  private addMonths(data: string | Date, meses: number): string {
    const base = new Date(data);
    const resultado = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + meses, base.getUTCDate()));
    return resultado.toISOString().slice(0, 10);
  }

  async create(createManutencaoDto: CreateManutencaoDto) {
    try {
      if(!createManutencaoDto.caminhaoId || !createManutencaoDto.oficinaId  || !createManutencaoDto.data){
        return { message: 'Verifique os campos obrigatórios!' };
      }

      const numeroParcelas = createManutencaoDto.numeroParcelas && createManutencaoDto.numeroParcelas > 1
        ? createManutencaoDto.numeroParcelas
        : 1;

      const inserted = await this.sql`
        INSERT INTO "Manutencao" (descricao, custo, data, "caminhaoId", "oficinaId", "numeroParcelas")
        VALUES (${createManutencaoDto.descricao}, ${createManutencaoDto.custo}, ${createManutencaoDto.data}, ${createManutencaoDto.caminhaoId}, ${createManutencaoDto.oficinaId}, ${numeroParcelas})
        RETURNING id
      `;
      const manutencaoId = inserted[0].id;

      const valorParcela = Math.round((createManutencaoDto.custo / numeroParcelas) * 100) / 100;
      for (let numero = 1; numero <= numeroParcelas; numero++) {
        const valor = numero < numeroParcelas
          ? valorParcela
          : Math.round((createManutencaoDto.custo - valorParcela * (numeroParcelas - 1)) * 100) / 100;
        const dataVencimento = this.addMonths(createManutencaoDto.data, numero - 1);
        await this.sql`
          INSERT INTO "ManutencaoParcela" ("manutencaoId", numero, valor, "dataVencimento", pago)
          VALUES (${manutencaoId}, ${numero}, ${valor}, ${dataVencimento}, FALSE)
        `;
      }

      return { message: 'Manutenção criada com sucesso!' };
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      return { message: 'Erro ao criar manutenção!', error: error };
    }
  }

  async findAll() {
    try {
      const data = await this.sql`
        SELECT
          m.id,
          m.descricao,
          m.custo,
          m.data,
          m."caminhaoId",
          m."oficinaId",
          m."numeroParcelas",
          c.placa AS "placaCaminhao",
          o."nomeOficina" AS "nomeOficina",
          COALESCE(p."totalParcelas", 0) AS "totalParcelas",
          COALESCE(p."parcelasPagas", 0) AS "parcelasPagas"
        FROM "Manutencao" m
        JOIN "Caminhao" c ON c.id = m."caminhaoId"
        JOIN "Oficina" o ON o.id = m."oficinaId"
        LEFT JOIN (
          SELECT "manutencaoId", COUNT(*) AS "totalParcelas", COUNT(*) FILTER (WHERE pago) AS "parcelasPagas"
          FROM "ManutencaoParcela"
          GROUP BY "manutencaoId"
        ) p ON p."manutencaoId" = m.id
        ORDER BY m.data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      return { message: 'Erro ao buscar manutenções!', error: error };
    }
  }

  async findParcelas(manutencaoId: number) {
    try {
      const data = await this.sql`
        SELECT id, "manutencaoId", numero, valor, "dataVencimento", pago
        FROM "ManutencaoParcela"
        WHERE "manutencaoId" = ${manutencaoId}
        ORDER BY numero ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar parcelas da manutenção:', error);
      return { message: 'Erro ao buscar parcelas da manutenção!', error: error };
    }
  }

  async pagarParcela(parcelaId: number, pago: boolean) {
    try {
      await this.sql`UPDATE "ManutencaoParcela" SET pago = ${pago} WHERE id = ${parcelaId}`;
      return { message: 'Parcela atualizada com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      return { message: 'Erro ao atualizar parcela!', error: error };
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
