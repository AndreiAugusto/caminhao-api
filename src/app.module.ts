import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaminhaoModule } from './caminhao/caminhao.module';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { MotoristaModule } from './motorista/motorista.module';
import { OficinaModule } from './oficina/oficina.module';
import { CaminhaoMotoristaModule } from './caminhao-motorista/caminhao-motorista.module';
import { ManutencaoModule } from './manutencao/manutencao.module';

@Module({
  imports: [CaminhaoModule, ConfigModule.forRoot(), UsuarioModule, MotoristaModule, OficinaModule, CaminhaoMotoristaModule, ManutencaoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
