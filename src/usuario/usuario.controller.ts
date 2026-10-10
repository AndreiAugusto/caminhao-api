import { Body, Controller, Get, Patch, Post, Req, HttpCode, HttpStatus, BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Public } from '../auth/public.decorator';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar dados do usuário logado' })
  @Get('me')
  async getMe(@Req() req: any) {
    const data = await this.usuarioService.findOne(req.user.id);
    if (!Array.isArray(data) || data.length === 0) {
      throw new NotFoundException('Usuário não encontrado!');
    }
    const { id, nome, email } = data[0];
    return { id, nome, email };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados do usuário logado' })
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdatePerfilDto) {
    if (!dto.senhaAtual) {
      throw new BadRequestException('Informe a senha atual!');
    }
    const data = await this.usuarioService.findOne(req.user.id);
    if (!Array.isArray(data) || data.length === 0) {
      throw new NotFoundException('Usuário não encontrado!');
    }
    const user = data[0];

    // 400 e não 401: o interceptor do front desloga em qualquer 401
    const isPasswordValid = await bcrypt.compare(dto.senhaAtual, user.senha);
    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta!');
    }

    const nome = dto.nome?.trim();
    const email = dto.email?.trim();
    if (email && email !== user.email) {
      const emailEmUso = await this.usuarioService.findOneByEmail({ email });
      if (Array.isArray(emailEmUso) && emailEmUso.length > 0) {
        throw new ConflictException('Este e-mail já está em uso!');
      }
    }
    if (dto.novaSenha !== undefined && dto.novaSenha.length < 4) {
      throw new BadRequestException('A nova senha deve ter pelo menos 4 caracteres!');
    }

    const senha = dto.novaSenha ? await bcrypt.hash(dto.novaSenha, Number(process.env.SALT)) : undefined;
    const res = await this.usuarioService.update(user.id, { nome, email, senha });
    if ((res as any).error) {
      throw new BadRequestException(res.message);
    }
    return { message: 'Dados atualizados com sucesso!' };
  }

  @Public()
  @ApiOperation({ summary: 'Login' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUsuarioDto) {
    const { email, password } = loginDto;
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios!');
    }
    const userExists = await this.usuarioService.findOneByEmail({ email });
    if (!userExists || !Array.isArray(userExists) || userExists.length === 0) {
      throw new NotFoundException('Usuário não encontrado!');
    }
    const user = userExists[0];

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta!');
    }

    const accessToken = jwt.sign(
      { id: user.id, nome: user.nome, empresaId: user.empresaId },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN },
    );
    return { user: { id: user.id, name: user.nome, email: user.email }, accessToken };
  }

  @Public()
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    const { email, nome, senha } = createUsuarioDto;
    if (!email || !nome || !senha) {
      throw new BadRequestException('Nome, email e senha são obrigatórios!');
    }
    const userExists = await this.usuarioService.findOneByEmail({ email });
    if (userExists && Array.isArray(userExists) && userExists.length > 0) {
      throw new ConflictException('Usuário já existe!');
    }
    const hashedPassword = await bcrypt.hash(senha, Number(process.env.SALT));

    const newUser = await this.usuarioService.createUsuario({
      nome,
      email,
      senha: hashedPassword,
    });
    return newUser;
  }
}
