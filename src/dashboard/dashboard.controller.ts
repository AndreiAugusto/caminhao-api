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

  @ApiOperation({ summary: 'Últimas movimentações (fretes, manutenções, abastecimentos)' })
  @ApiQuery({ name: 'limite', required: false, example: 10, description: 'Quantidade de registros (padrão: 10)' })
  @Get('ultimas-movimentacoes')
  ultimasMovimentacoes(@Query('limite') limite?: string) {
    return this.dashboardService.ultimasMovimentacoes(+(limite ?? 10));
  }

  @ApiOperation({ summary: 'Extrato unificado de movimentações (frete, abastecimento, manutenção, custo fixo)' })
  @ApiQuery({ name: 'dataInicio', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'dataFim', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'tipos', required: false, example: 'frete,manutencao', description: 'Lista separada por vírgula: frete,abastecimento,manutencao,custo-fixo' })
  @ApiQuery({ name: 'caminhaoId', required: false, example: 1 })
  @ApiQuery({ name: 'motoristaId', required: false, example: 1 })
  @Get('extrato')
  extrato(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tipos') tipos?: string,
    @Query('caminhaoId') caminhaoId?: string,
    @Query('motoristaId') motoristaId?: string,
  ) {
    return this.dashboardService.extrato({
      dataInicio,
      dataFim,
      tipos: tipos ? tipos.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      caminhaoId: caminhaoId ? +caminhaoId : undefined,
      motoristaId: motoristaId ? +motoristaId : undefined,
    });
  }
}
