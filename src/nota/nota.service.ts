import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { del, get } from '@vercel/blob';
import { Readable } from 'stream';
import type { Response } from 'express';
import { ConfirmarNotaDto } from './dto/confirmar-nota.dto';

@Injectable()
export class NotaService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  /**
   * Grava a nota no banco depois que o arquivo já foi enviado direto do
   * navegador pro Vercel Blob (mesmo fluxo do Escritório Virtual).
   */
  async confirmar(empresaId: number, dto: ConfirmarNotaDto) {
    try {
      const freteId = dto.freteId ? Number(dto.freteId) : null;
      const manutencaoId = dto.manutencaoId ? Number(dto.manutencaoId) : null;
      const adiantamentoId = dto.adiantamentoId ? Number(dto.adiantamentoId) : null;
      const vinculos = [freteId, manutencaoId, adiantamentoId].filter((v) => v !== null).length;
      if (!dto.url || !dto.nomeArquivo || vinculos !== 1) {
        return { message: 'Informe o arquivo e um frete, manutenção OU adiantamento!', error: true };
      }

      const inserted = await this.sql`
        INSERT INTO "Nota" ("freteId", "manutencaoId", "adiantamentoId", url, "nomeArquivo", "mimeType", tamanho)
        SELECT ${freteId}::int, ${manutencaoId}::int, ${adiantamentoId}::int, ${dto.url}::text, ${dto.nomeArquivo}::text, ${dto.mimeType ?? null}::text, ${dto.tamanho ?? null}::int
        WHERE EXISTS (SELECT 1 FROM "Frete" WHERE id = ${freteId}::int AND "empresaId" = ${empresaId})
           OR EXISTS (SELECT 1 FROM "Manutencao" WHERE id = ${manutencaoId}::int AND "empresaId" = ${empresaId})
           OR EXISTS (SELECT 1 FROM "Adiantamento" WHERE id = ${adiantamentoId}::int AND "empresaId" = ${empresaId})
        RETURNING id
      `;
      if (inserted.length === 0) {
        return { message: 'Frete, manutenção ou adiantamento não encontrado!', error: true };
      }
      return { message: 'Nota anexada com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      return { message: 'Erro ao salvar nota!', error: error };
    }
  }

  async findAll(empresaId: number, filtros: { freteId?: number; manutencaoId?: number; adiantamentoId?: number }) {
    try {
      const freteId = filtros.freteId ?? null;
      const manutencaoId = filtros.manutencaoId ?? null;
      const adiantamentoId = filtros.adiantamentoId ?? null;
      if (freteId === null && manutencaoId === null && adiantamentoId === null) return [];

      return await this.sql`
        SELECT n.id, n."freteId", n."manutencaoId", n."adiantamentoId", n."nomeArquivo", n."mimeType", n.tamanho, n."criadoEm"
        FROM "Nota" n
        LEFT JOIN "Frete" f ON f.id = n."freteId"
        LEFT JOIN "Manutencao" m ON m.id = n."manutencaoId"
        LEFT JOIN "Adiantamento" ad ON ad.id = n."adiantamentoId"
        WHERE ((${freteId}::int IS NOT NULL AND n."freteId" = ${freteId}::int)
           OR (${manutencaoId}::int IS NOT NULL AND n."manutencaoId" = ${manutencaoId}::int)
           OR (${adiantamentoId}::int IS NOT NULL AND n."adiantamentoId" = ${adiantamentoId}::int))
          AND COALESCE(f."empresaId", m."empresaId", ad."empresaId") = ${empresaId}
        ORDER BY n."criadoEm", n.id
      `;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      return { message: 'Erro ao buscar notas!', error: error };
    }
  }

  async streamArquivo(empresaId: number, id: number, res: Response) {
    try {
      const rows = await this.notaDaEmpresa(empresaId, id);
      if (rows.length === 0) {
        res.status(404).json({ message: 'Nota não encontrada!' });
        return;
      }

      const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
      const resultado = await get(rows[0].url, { access: 'private', token });
      if (!resultado || resultado.statusCode !== 200) {
        res.status(404).json({ message: 'Arquivo não encontrado no armazenamento!' });
        return;
      }

      res.setHeader('Content-Type', resultado.blob.contentType || rows[0].mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(rows[0].nomeArquivo)}"`);
      Readable.fromWeb(resultado.stream as any).pipe(res);
    } catch (error) {
      console.error('Erro ao buscar arquivo da nota:', error);
      res.status(500).json({ message: 'Erro ao buscar arquivo da nota!', error: String(error) });
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      const rows = await this.notaDaEmpresa(empresaId, id);
      if (rows.length === 0) {
        return { message: 'Nota não encontrada!', error: true };
      }

      await this.apagarArquivos(rows.map((r) => r.url));
      await this.sql`DELETE FROM "Nota" WHERE id = ${id}`;
      return { message: 'Nota removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover nota:', error);
      return { message: 'Erro ao remover nota!', error: error };
    }
  }

  /**
   * Chamado antes de excluir um frete/manutenção/adiantamento: o ON DELETE CASCADE apaga
   * as linhas de "Nota", mas os arquivos no Blob precisam ser removidos aqui.
   */
  async removerArquivosDe(empresaId: number, vinculo: { freteId?: number; manutencaoId?: number; adiantamentoId?: number }) {
    const rows = vinculo.freteId
      ? await this.sql`
          SELECT n.url FROM "Nota" n JOIN "Frete" f ON f.id = n."freteId"
          WHERE n."freteId" = ${vinculo.freteId} AND f."empresaId" = ${empresaId}
        `
      : vinculo.manutencaoId
        ? await this.sql`
            SELECT n.url FROM "Nota" n JOIN "Manutencao" m ON m.id = n."manutencaoId"
            WHERE n."manutencaoId" = ${vinculo.manutencaoId} AND m."empresaId" = ${empresaId}
          `
        : await this.sql`
            SELECT n.url FROM "Nota" n JOIN "Adiantamento" ad ON ad.id = n."adiantamentoId"
            WHERE n."adiantamentoId" = ${vinculo.adiantamentoId} AND ad."empresaId" = ${empresaId}
          `;
    await this.apagarArquivos(rows.map((r) => r.url));
  }

  /** A nota não tem empresa própria: herda a do frete, manutenção ou adiantamento. */
  private notaDaEmpresa(empresaId: number, id: number) {
    return this.sql`
      SELECT n.url, n."mimeType", n."nomeArquivo"
      FROM "Nota" n
      LEFT JOIN "Frete" f ON f.id = n."freteId"
      LEFT JOIN "Manutencao" m ON m.id = n."manutencaoId"
      LEFT JOIN "Adiantamento" ad ON ad.id = n."adiantamentoId"
      WHERE n.id = ${id} AND COALESCE(f."empresaId", m."empresaId", ad."empresaId") = ${empresaId}
    `;
  }

  private async apagarArquivos(urls: string[]) {
    if (urls.length === 0) return;
    const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
    await del(urls, { token });
  }
}
