import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { AdiantamentoService } from './adiantamento.service';
import { CreateAdiantamentoDto } from './dto/create-adiantamento.dto';
import { UpdateAdiantamentoDto } from './dto/update-adiantamento.dto';

@ApiTags('adiantamento')
@ApiBearerAuth()
@Controller('adiantamento')
export class AdiantamentoController {
  constructor(private readonly adiantamentoService: AdiantamentoService) {}

  @ApiOperation({ summary: 'Registrar adiantamento de salário de um motorista' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() dto: CreateAdiantamentoDto) {
    return this.adiantamentoService.create(empresaId, dto);
  }

  @ApiOperation({ summary: 'Listar adiantamentos com parcelas (com mês/ano: os feitos naquele mês e os com desconto naquele salário)' })
  @ApiQuery({ name: 'mes', required: false, example: 10, description: 'Mês do desconto ou da data do adiantamento' })
  @ApiQuery({ name: 'ano', required: false, example: 2026, description: 'Ano do desconto ou da data do adiantamento' })
  @ApiQuery({ name: 'motoristaId', required: false, example: 1 })
  @Get()
  findAll(
    @EmpresaId() empresaId: number,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
    @Query('motoristaId') motoristaId?: string,
  ) {
    return this.adiantamentoService.findAll(empresaId, {
      mes: mes ? +mes : undefined,
      ano: ano ? +ano : undefined,
      motoristaId: motoristaId ? +motoristaId : undefined,
    });
  }

  @ApiOperation({ summary: 'Atualizar adiantamento' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() dto: UpdateAdiantamentoDto) {
    return this.adiantamentoService.update(empresaId, +id, dto);
  }

  @ApiOperation({ summary: 'Remover adiantamento' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.adiantamentoService.remove(empresaId, +id);
  }
}
