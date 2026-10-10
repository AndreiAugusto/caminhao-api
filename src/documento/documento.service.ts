import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { put, del, get } from '@vercel/blob';
import { Readable } from 'stream';
import type { Response } from 'express';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { ConfirmarUploadDto } from './dto/confirmar-upload.dto';
import { vinculosDaEmpresa, VINCULO_INVALIDO } from '../empresa/vinculos';

@Injectable()
export class DocumentoService {
  private readonly sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');
    this.sql = neon(databaseUrl);
  }

  async create(empresaId: number, dto: CreateDocumentoDto, file?: Express.Multer.File) {
    try {
      if (!dto.titulo || !dto.tipo || !file) {
        return { message: 'Verifique os campos obrigatórios (título, tipo e arquivo)!' };
      }

      const caminhaoId = dto.caminhaoId ? Number(dto.caminhaoId) : null;
      const motoristaId = dto.motoristaId ? Number(dto.motoristaId) : null;
      const fazendaId = dto.fazendaId ? Number(dto.fazendaId) : null;
      if (!(await vinculosDaEmpresa(this.sql, empresaId, { caminhaoId, motoristaId, fazendaId }))) {
        return VINCULO_INVALIDO;
      }

      const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
      const pathname = `documentos/${dto.tipo}/${Date.now()}-${file.originalname}`;
      const blob = await put(pathname, file.buffer, {
        access: 'private',
        token,
        contentType: file.mimetype,
      });

      const inserted = await this.sql`
        INSERT INTO "Documento"
          (titulo, categoria, tipo, "caminhaoId", "motoristaId", "fazendaId", url, "nomeArquivo", "mimeType", tamanho, "empresaId")
        VALUES (
          ${dto.titulo}, ${dto.categoria ?? null}, ${dto.tipo},
          ${caminhaoId}, ${motoristaId}, ${fazendaId},
          ${blob.url}, ${file.originalname}, ${file.mimetype}, ${file.size}, ${empresaId}
        )
        RETURNING id
      `;

      return { message: 'Documento enviado com sucesso!', id: inserted[0].id, url: blob.url };
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      return { message: 'Erro ao enviar documento!', error: error };
    }
  }

  /**
   * Grava o registro do documento no banco quando o arquivo já foi
   * enviado direto do navegador pro Vercel Blob (upload direto, sem
   * passar pela função serverless — usado para arquivos maiores,
   * que não caberiam no limite de 4.5MB de payload da Vercel).
   */
  async createFromBlob(empresaId: number, dto: ConfirmarUploadDto) {
    try {
      if (!dto.titulo || !dto.tipo || !dto.url) {
        return { message: 'Verifique os campos obrigatórios (título, tipo e arquivo)!' };
      }

      const caminhaoId = dto.caminhaoId ? Number(dto.caminhaoId) : null;
      const motoristaId = dto.motoristaId ? Number(dto.motoristaId) : null;
      const fazendaId = dto.fazendaId ? Number(dto.fazendaId) : null;
      if (!(await vinculosDaEmpresa(this.sql, empresaId, { caminhaoId, motoristaId, fazendaId }))) {
        return VINCULO_INVALIDO;
      }

      const inserted = await this.sql`
        INSERT INTO "Documento"
          (titulo, categoria, tipo, "caminhaoId", "motoristaId", "fazendaId", url, "nomeArquivo", "mimeType", tamanho, "empresaId")
        VALUES (
          ${dto.titulo}, ${dto.categoria ?? null}, ${dto.tipo},
          ${caminhaoId}, ${motoristaId}, ${fazendaId},
          ${dto.url}, ${dto.nomeArquivo}, ${dto.mimeType}, ${dto.tamanho}, ${empresaId}
        )
        RETURNING id
      `;

      return { message: 'Documento enviado com sucesso!', id: inserted[0].id, url: dto.url };
    } catch (error) {
      console.error('Erro ao confirmar documento enviado:', error);
      return { message: 'Erro ao salvar documento enviado!', error: error };
    }
  }

  async findAll(empresaId: number, filtros: { tipo?: string; entidadeId?: number }) {
    try {
      const tipo = filtros.tipo ?? null;
      const entidadeId = filtros.entidadeId ?? null;

      const data = await this.sql`
        SELECT
          d.*,
          c.placa AS "placaCaminhao",
          m."nomeMotorista",
          f.nome AS "nomeFazenda"
        FROM "Documento" d
        LEFT JOIN "Caminhao" c ON c.id = d."caminhaoId"
        LEFT JOIN "Motorista" m ON m.id = d."motoristaId"
        LEFT JOIN "Fazenda" f ON f.id = d."fazendaId"
        WHERE d."empresaId" = ${empresaId}
          AND (${tipo}::text IS NULL OR d.tipo = ${tipo}::text)
          AND (
            ${entidadeId}::int IS NULL
            OR d."caminhaoId" = ${entidadeId}::int
            OR d."motoristaId" = ${entidadeId}::int
            OR d."fazendaId" = ${entidadeId}::int
          )
        ORDER BY d."criadoEm" DESC
      `;
      return data;
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return { message: 'Erro ao buscar documentos!', error: error };
    }
  }

  async update(empresaId: number, id: number, dto: UpdateDocumentoDto) {
    try {
      if (dto.titulo) {
        await this.sql`UPDATE "Documento" SET titulo = ${dto.titulo} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (dto.categoria !== undefined) {
        await this.sql`UPDATE "Documento" SET categoria = ${dto.categoria || null} WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      }
      if (dto.tipo) {
        // O "onde foi salvo" é um conjunto único (tipo + a entidade daquele tipo) —
        // troca de tipo sempre zera os vínculos dos outros tipos, senão um
        // documento ficaria linkado simultaneamente a um caminhão E um motorista.
        const caminhaoId = dto.tipo === 'caminhao' && dto.caminhaoId ? Number(dto.caminhaoId) : null;
        const motoristaId = dto.tipo === 'motorista' && dto.motoristaId ? Number(dto.motoristaId) : null;
        const fazendaId = dto.tipo === 'fazenda' && dto.fazendaId ? Number(dto.fazendaId) : null;
        if (!(await vinculosDaEmpresa(this.sql, empresaId, { caminhaoId, motoristaId, fazendaId }))) {
          return VINCULO_INVALIDO;
        }
        await this.sql`
          UPDATE "Documento"
          SET tipo = ${dto.tipo}, "caminhaoId" = ${caminhaoId}, "motoristaId" = ${motoristaId}, "fazendaId" = ${fazendaId}
          WHERE id = ${id} AND "empresaId" = ${empresaId}
        `;
      }
      return { message: 'Documento atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return { message: 'Erro ao atualizar documento!', error: error };
    }
  }

  async streamArquivo(empresaId: number, id: number, res: Response) {
    try {
      const rows = await this.sql`SELECT url, "mimeType", "nomeArquivo" FROM "Documento" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      if (rows.length === 0) {
        res.status(404).json({ message: 'Documento não encontrado!' });
        return;
      }

      const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
      const resultado = await get(rows[0].url, { access: 'private', token });
      if (!resultado || resultado.statusCode !== 200) {
        res.status(404).json({ message: 'Arquivo não encontrado no armazenamento!' });
        return;
      }

      res.setHeader('Content-Type', resultado.blob.contentType || rows[0].mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${rows[0].nomeArquivo}"`);
      Readable.fromWeb(resultado.stream as any).pipe(res);
    } catch (error) {
      console.error('Erro ao buscar arquivo do documento:', error);
      res.status(500).json({ message: 'Erro ao buscar arquivo do documento!', error: String(error) });
    }
  }

  async remove(empresaId: number, id: number) {
    try {
      const rows = await this.sql`SELECT url FROM "Documento" WHERE id = ${id} AND "empresaId" = ${empresaId}`;
      if (rows.length === 0) {
        return { message: 'Documento não encontrado!' };
      }

      const token = this.configService.get('BLOB_READ_WRITE_TOKEN');
      await del(rows[0].url, { token });
      await this.sql`DELETE FROM "Documento" WHERE id = ${id} AND "empresaId" = ${empresaId}`;

      return { message: 'Documento removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      return { message: 'Erro ao remover documento!', error: error };
    }
  }
}
