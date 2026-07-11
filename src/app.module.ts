import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaminhaoModule } from './caminhao/caminhao.module';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { MotoristaModule } from './motorista/motorista.module';
import { OficinaModule } from './oficina/oficina.module';
import { CaminhaoMotoristaModule } from './caminhao-motorista/caminhao-motorista.module';
import { ManutencaoModule } from './manutencao/manutencao.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FreteModule } from './frete/frete.module';
import { AbastecimentoModule } from './abastecimento/abastecimento.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { EstadoModule } from './estado/estado.module';
import { CidadeModule } from './cidade/cidade.module';
import { CargaModule } from './carga/carga.module';
import { CustoFixoModule } from './custo-fixo/custo-fixo.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CaminhaoModule,
    UsuarioModule,
    MotoristaModule,
    OficinaModule,
    CaminhaoMotoristaModule,
    ManutencaoModule,
    DashboardModule,
    FreteModule,
    AbastecimentoModule,
    EstadoModule,
    CidadeModule,
    CargaModule,
    CustoFixoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
