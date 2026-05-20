import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [UsuarioService],
  controllers: [UsuarioController],
  imports: [ConfigModule],
})
export class UsuarioModule {}