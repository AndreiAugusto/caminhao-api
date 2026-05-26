import { Body, Controller, Get, Param, Patch, Post, HttpCode, HttpStatus, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('')
  async getTable() {
    return this.usuarioService.getTableUsuario();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Post('')
  async createUsuario(@Body() createUsuarioDto: CreateUsuarioDto){
    return this.usuarioService.createUsuario(createUsuarioDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;
    if(!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios!');
    }
    const userExists = await this.usuarioService.findOneByEmail({ email });
    if (!userExists || !Array.isArray(userExists) || userExists.length === 0) {
      throw new UnauthorizedException('Usuário não encontrado!');
    }
    const user = userExists[0];

    const isPasswordValid = await bcrypt.compare(password, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta!');
    }

    const accessToken = jwt.sign(
                { id: user.id,
                  nome: user.nome
                 },
                process.env.TOKEN_SECRET,
                { expiresIn: process.env.TOKEN_EXPIRES_IN }
            );
    // const accessToken = 'teste';
    return { user:{ id: user.id, name: user.nome, email: user.email }, accessToken };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    const { email, nome, senha } = createUsuarioDto;
    if(!email || !nome || !senha) {
      throw new BadRequestException('Nome, email e senha são obrigatórios!');
    }
    const userExists = await this.usuarioService.findOneByEmail({ email });
    if (userExists && Array.isArray(userExists) && userExists.length > 0) {
      throw new ConflictException('Usuário já existe!');
    }
    const hashedPassword = await bcrypt.hash(
      senha, 
      Number(process.env.SALT)
    );

    const newUser = await this.usuarioService.createUsuario({
      nome,
      email,
      senha: hashedPassword,
    });
    return newUser;
  }
}