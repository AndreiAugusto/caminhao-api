import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Total de manutenções registradas' })
  @Get('manutencao/count')
  manutencaoCount() {
    return this.dashboardService.manutencaoCount();
  }

  @ApiOperation({ summary: 'Total de oficinas cadastradas' })
  @Get('oficina/count')
  oficinaCount() {
    return this.dashboardService.oficinaCount();
  }

  @ApiOperation({ summary: 'Total de manutenções em uma oficina' })
  @Get('oficina/countOne/:id')
  oficinaCountOne(@Param('id') id: string) {
    return this.dashboardService.oficinaCountOne(+id);
  }

  @ApiOperation({ summary: 'Total de caminhões cadastrados' })
  @Get('caminhao/count')
  caminhaoCount() {
    return this.dashboardService.caminhaoCount();
  }

  @ApiOperation({ summary: 'Total de manutenções de um caminhão' })
  @Get('caminhao/countOne/:id')
  caminhaoCountOne(@Param('id') id: string) {
    return this.dashboardService.caminhaoCountOne(+id);
  }

  @ApiOperation({ summary: 'Calcular pagamento do motorista no mês' })
  @ApiQuery({ name: 'mes', required: true, example: 6, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2025, description: 'Ano' })
  @Get('motorista/pagamento/:id')
  motoristaPagamento(
    @Param('id') id: string,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
  ) {
    return this.dashboardService.motoristaPagamento(+id, +mes, +ano);
  }

  @ApiOperation({ summary: 'Resumo financeiro do mês (fretes, manutenções, abastecimentos)' })
  @ApiQuery({ name: 'mes', required: true, example: 6, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2025, description: 'Ano' })
  @Get('resumo/mes')
  resumoMes(@Query('mes') mes: string, @Query('ano') ano: string) {
    return this.dashboardService.resumoMes(+mes, +ano);
  }
}
