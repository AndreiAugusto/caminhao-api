import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Total de manutenções registradas' })
  @Get('manutencao/count')
  manutencaoCount(@EmpresaId() empresaId: number) {
    return this.dashboardService.manutencaoCount(empresaId);
  }

  @ApiOperation({ summary: 'Total de oficinas cadastradas' })
  @Get('oficina/count')
  oficinaCount(@EmpresaId() empresaId: number) {
    return this.dashboardService.oficinaCount(empresaId);
  }

  @ApiOperation({ summary: 'Total de manutenções em uma oficina' })
  @Get('oficina/countOne/:id')
  oficinaCountOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.dashboardService.oficinaCountOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Total de caminhões cadastrados' })
  @Get('caminhao/count')
  caminhaoCount(@EmpresaId() empresaId: number) {
    return this.dashboardService.caminhaoCount(empresaId);
  }

  @ApiOperation({ summary: 'Total de manutenções de um caminhão' })
  @Get('caminhao/countOne/:id')
  caminhaoCountOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.dashboardService.caminhaoCountOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Calcular pagamento do motorista no mês' })
  @ApiQuery({ name: 'mes', required: true, example: 6, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2025, description: 'Ano' })
  @Get('motorista/pagamento/:id')
  motoristaPagamento(
    @EmpresaId() empresaId: number,
    @Param('id') id: string,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
  ) {
    return this.dashboardService.motoristaPagamento(empresaId, +id, +mes, +ano);
  }

  @ApiOperation({ summary: 'Resumo financeiro do mês (fretes, manutenções, abastecimentos)' })
  @ApiQuery({ name: 'mes', required: true, example: 6, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2025, description: 'Ano' })
  @Get('resumo/mes')
  resumoMes(@EmpresaId() empresaId: number, @Query('mes') mes: string, @Query('ano') ano: string) {
    return this.dashboardService.resumoMes(empresaId, +mes, +ano);
  }

  @ApiOperation({ summary: 'Salário calculado de todos os motoristas no mês (comissão sobre os fretes)' })
  @ApiQuery({ name: 'mes', required: true, example: 6, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, example: 2025, description: 'Ano' })
  @Get('salarios')
  salariosMes(@EmpresaId() empresaId: number, @Query('mes') mes: string, @Query('ano') ano: string) {
    return this.dashboardService.salariosMes(empresaId, +mes, +ano);
  }

  @ApiOperation({ summary: 'Últimas movimentações (fretes, manutenções, abastecimentos)' })
  @ApiQuery({ name: 'limite', required: false, example: 10, description: 'Quantidade de registros (padrão: 10)' })
  @Get('ultimas-movimentacoes')
  ultimasMovimentacoes(@EmpresaId() empresaId: number, @Query('limite') limite?: string) {
    return this.dashboardService.ultimasMovimentacoes(empresaId, +(limite ?? 10));
  }

  @ApiOperation({ summary: 'Extrato unificado de movimentações (frete, abastecimento, manutenção, custo fixo)' })
  @ApiQuery({ name: 'dataInicio', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'dataFim', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'tipos', required: false, example: 'frete,manutencao', description: 'Lista separada por vírgula: frete,abastecimento,manutencao,custo-fixo,salario-motorista,adiantamento' })
  @ApiQuery({ name: 'caminhaoId', required: false, example: 1 })
  @ApiQuery({ name: 'motoristaId', required: false, example: 1 })
  @Get('extrato')
  extrato(
    @EmpresaId() empresaId: number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tipos') tipos?: string,
    @Query('caminhaoId') caminhaoId?: string,
    @Query('motoristaId') motoristaId?: string,
  ) {
    return this.dashboardService.extrato(empresaId, {
      dataInicio,
      dataFim,
      tipos: tipos ? tipos.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      caminhaoId: caminhaoId ? +caminhaoId : undefined,
      motoristaId: motoristaId ? +motoristaId : undefined,
    });
  }
}
