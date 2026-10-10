import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { NotaService } from '../nota/nota.service';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';

@Injectable()
export class ManutencaoService {
  private readonly sql;

  constructor(private configService: ConfigService, private notaService: NotaService) {
      const databaseUrl = this.configService.get('DATABASE_URL');
      this.sql = neon(databaseUrl);
  }
  private addMonths(data: string | Date, meses: number): string {
    const base = new Date(data);
    const resultado = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + meses, base.getUTCDate()));
    return resultado.toISOString().slice(0, 10);
  }

  async create(empresaId: number, createManutencaoDto: CreateManutencaoDto) {
    try {
      if(!createManutencaoDto.caminhaoId || !createManutencaoDto.oficinaId  || !createManutencaoDto.data){
        return { message: 'Verifique os campos obrigatórios!' };
      }
      if (!(await vinculosDaEmpresa(this.sql, empresaId, createManutencaoDto))) {
        return VINCULO_INVALIDO;
      }

      const numeroParcelas = createManutencaoDto.numeroParcelas && createManutencaoDto.numeroParcelas > 1
        ? createManutencaoDto.numeroParcelas
        : 1;

      const inserted = await this.sql`
        INSERT INTO "Manutencao" (descricao, custo, data, "caminhaoId", "oficinaId", "numeroParcelas", "empresaId")
        VALUES (${createManutencaoDto.descricao}, ${createManutencaoDto.custo}, ${createManutencaoDto.data}, ${createManutencaoDto.caminhaoId}, ${createManutencaoDto.oficinaId}, ${numeroParcelas}, ${empresaId})
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

      return { message: 'Manutenção criada com sucesso!', id: manutencaoId };
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      return { message: 'Erro ao criar manutenção!', error: error };
    }
  }

  async findAll(empresaId: number) {
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
          COALESCE(p."parcelasPagas", 0) AS "parcelasPagas",
          (SELECT COUNT(*) FROM "Nota" n WHERE n."manutencaoId" = m.id)::int AS "totalNotas"
        FROM "Manutencao" m
        JOIN "Caminhao" c ON c.id = m."caminhaoId"
        JOIN "Oficina" o ON o.id = m."oficinaId"
        LEFT JOIN (
          SELECT "manutencaoId", COUNT(*) AS "totalParcelas", COUNT(*) FILTER (WHERE pago) AS "parcelasPagas"
          FROM "ManutencaoParcela"
          GROUP BY "manutencaoId"
        ) p ON p."manutencaoId" = m.id
        WHERE m."empresaId" = ${empresaId}
        ORDER BY m.data DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      return { message: 'Erro ao buscar manutenções!', error: error };
    }
  }

  async findParcelas(empresaId: number, manutencaoId: number) {
    try {
      const data = await this.sql`
        SELECT mp.id, mp."manutencaoId", mp.numero, mp.valor, mp."dataVencimento", mp.pago
        FROM "ManutencaoParcela" mp
        JOIN "Manutencao" m ON m.id = mp."manutencaoId"
        WHERE mp."manutencaoId" = ${manutencaoId} AND m."empresaId" = ${empresaId}
        ORDER BY mp.numero ASC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar parcelas da manutenção:', error);
      return { message: 'Erro ao buscar parcelas da manutenção!', error: error };
    }
  }

  async pagarParcela(empresaId: number, parcelaId: number, pago: boolean) {
    try {
      await this.sql`
        UPDATE "ManutencaoParcela" mp SET pago = ${pago}
        FROM "Manutencao" m
        WHERE mp.id = ${parcelaId} AND m.id = mp."manutencaoId" AND m."empresaId" = ${empresaId}
      `;
      return { message: 'Parcela atualizada com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      return { message: 'Erro ao atualizar parcela!', error: error };
    }
  }

  async findOne(empresaId: number, id: number) {
    try {
        const data = await this.sql`Select * from "Manutencao" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        return data;            
    } catch (error) {
        console.error('Erro ao buscar manutenções:', error);
        return { message: 'Erro ao buscar manutenções!', error: error };
    }
  }

  async update(empresaId: number, id: number, updateManutencaoDto: UpdateManutencaoDto) {
    try {
        if (!(await vinculosDaEmpresa(this.sql, empresaId, updateManutencaoDto))) {
          return VINCULO_INVALIDO;
        }
        if(updateManutencaoDto.descricao){
            await this.sql`UPDATE "Manutencao" SET descricao = ${updateManutencaoDto.descricao} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateManutencaoDto.custo){
            await this.sql`UPDATE "Manutencao" SET custo = ${updateManutencaoDto.custo} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateManutencaoDto.data){
            await this.sql`UPDATE "Manutencao" SET data = ${updateManutencaoDto.data} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateManutencaoDto.caminhaoId){
            await this.sql`UPDATE "Manutencao" SET "caminhaoId" = ${updateManutencaoDto.caminhaoId} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }
        if(updateManutencaoDto.oficinaId){
            await this.sql`UPDATE "Manutencao" SET "oficinaId" = ${updateManutencaoDto.oficinaId} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
        }

        return { message: 'Manutenção atualizada com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar manutenção:', error);
        return { message: 'Erro ao atualizar manutenção!', error: error };            
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      await this.notaService.removerArquivosDe(empresaId, { manutencaoId: id });
      await this.sql`DELETE FROM "Manutencao" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      return { message: 'Manutenção removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover manutenção:', error);
      return { message: 'Erro ao remover manutenção!', error: error };
    }
  }
}
