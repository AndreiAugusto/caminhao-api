// database.service.ts
import { neon } from '@neondatabase/serverless';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
    private readonly sql;

    constructor(private configService: ConfigService) {
        const databaseUrl = this.configService.get('DATABASE_URL');
        this.sql = neon(databaseUrl);
    }
    async getTableUsuario() {
        try {
            const data = await this.sql`Select * from usuario`;
            return data;            
        } catch (error) {
            console.error('Erro ao buscar tabela de usuários:', error);
            return { message: 'Erro ao buscar tabela de usuários!', error: error };
        }
    }
    
    async findOne(id: number) {
        try {
            const data = await this.sql`Select * from usuario where id = ${id}`;
            return data;            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return { message: 'Erro ao buscar usuário!', error: error };
        }
    }

    async createUsuario(createUsuarioDto: CreateUsuarioDto){
        try {
            await this.sql`INSERT INTO usuario (nome, email, senha) VALUES (${createUsuarioDto.nome}, ${createUsuarioDto.email}, ${createUsuarioDto.senha})`;
            return { message: 'Usuário criado com sucesso!' };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return { message: 'Erro ao criar usuário!', error: error };
        }
    }
    
    async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
        try {
            if(updateUsuarioDto.nome){
                await this.sql`UPDATE usuario SET nome = ${updateUsuarioDto.nome} WHERE id = ${id}`;
            }
            if(updateUsuarioDto.email){
                await this.sql`UPDATE usuario SET email = ${updateUsuarioDto.email} WHERE id = ${id}`;
            }
            if(updateUsuarioDto.senha){
                await this.sql`UPDATE usuario SET senha = ${updateUsuarioDto.senha} WHERE id = ${id}`;
            }
            return { message: 'Usuário atualizado com sucesso!' };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { message: 'Erro ao atualizar usuário!', error: error };            
        }
    }
}