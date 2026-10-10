import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { ManutencaoService } from './manutencao.service';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { UpdateParcelaDto } from './dto/update-parcela.dto';

@ApiTags('manutencao')
@ApiBearerAuth()
@Controller('manutencao')
export class ManutencaoController {
  constructor(private readonly manutencaoService: ManutencaoService) {}

  @ApiOperation({ summary: 'Registrar manutenção' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createManutencaoDto: CreateManutencaoDto) {
    return this.manutencaoService.create(empresaId, createManutencaoDto);
  }

  @ApiOperation({ summary: 'Listar todas as manutenções' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.manutencaoService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar manutenção por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.manutencaoService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Listar parcelas de uma manutenção' })
  @Get(':id/parcelas')
  findParcelas(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.manutencaoService.findParcelas(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar status de pagamento de uma parcela' })
  @Patch('parcela/:id')
  pagarParcela(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateParcelaDto: UpdateParcelaDto) {
    return this.manutencaoService.pagarParcela(empresaId, +id, updateParcelaDto.pago);
  }

  @ApiOperation({ summary: 'Atualizar manutenção' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateManutencaoDto: UpdateManutencaoDto) {
    return this.manutencaoService.update(empresaId, +id, updateManutencaoDto);
  }

  @ApiOperation({ summary: 'Remover manutenção' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.manutencaoService.remove(empresaId, +id);
  }
}
