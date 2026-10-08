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
  async confirmar(dto: ConfirmarNotaDto) {
    try {
      const freteId = dto.freteId ? Number(dto.freteId) : null;
      const manutencaoId = dto.manutencaoId ? Number(dto.manutencaoId) : null;
      if (!dto.url || !dto.nomeArquivo || (freteId === null) === (manutencaoId === null)) {
        return { message: 'Informe o arquivo e um frete OU uma manutenção!', error: true };
      }

      const inserted = await this.sql`
        INSERT INTO "Nota" ("freteId", "manutencaoId", url, "nomeArquivo", "mimeType", tamanho)
        VALUES (${freteId}, ${manutencaoId}, ${dto.url}, ${dto.nomeArquivo}, ${dto.mimeType ?? null}, ${dto.tamanho ?? null})
        RETURNING id
      `;
      return { message: 'Nota anexada com sucesso!', id: inserted[0].id };
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      return { message: 'Erro ao salvar nota!', error: error };
    }
  }

  async findAll(filtros: { freteId?: number; manutencaoId?: number }) {
    try {
      const freteId = filtros.freteId ?? null;
      const manutencaoId = filtros.manutencaoId ?? null;
      if (freteId === null && manutencaoId === null) return [];

      return await this.sql`
        SELECT id, "freteId", "manutencaoId", "nomeArquivo", "mimeType", tamanho, "criadoEm"
        FROM "Nota"
        WHERE (${freteId}::int IS NOT NULL AND "freteId" = ${freteId}::int)
           OR (${manutencaoId}::int IS NOT NULL AND "manutencaoId" = ${manutencaoId}::int)
        ORDER BY "criadoEm", id
      `;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      return { message: 'Erro ao buscar notas!', error: error };
    }
  }

  async streamArquivo(id: number, res: Response) {
    try {
      const rows = await this.sql`SELECT url, "mimeType", "nomeArquivo" FROM "Nota" WHERE id = ${id}`;
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

  async remove(id: number) {
    try {
      const rows = await this.sql`SELECT url FROM "Nota" WHERE id = ${id}`;
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
   * Chamado antes de excluir um frete/manutenção: o ON DELETE CASCADE apaga
   * as linhas de "Nota", mas os arquivos no Blob precisam ser removidos aqui.
   */
  async removerArquivosDe(vinculo: { freteId?: number; manutencaoId?: number }) {
    const rows = vinculo.freteId
      ? await this.sql`SELECT url FROM "Nota" WHERE "freteId" = ${vinculo.freteId}`
      : await this.sql`SELECT url FROM "Nota" WHERE "manutencaoId" = ${vinculo.manutencaoId}`;
    await this.apagarArquivos(rows.map((r) => r.url));
  }

  private async apagarArquivos(urls: string[]) {
    if (urls.length === 0) return;
    const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
    await del(urls, { token });
  }
}
