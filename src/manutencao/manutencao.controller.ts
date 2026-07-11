import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createManutencaoDto: CreateManutencaoDto) {
    return this.manutencaoService.create(createManutencaoDto);
  }

  @ApiOperation({ summary: 'Listar todas as manutenções' })
  @Get()
  findAll() {
    return this.manutencaoService.findAll();
  }

  @ApiOperation({ summary: 'Buscar manutenção por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manutencaoService.findOne(+id);
  }

  @ApiOperation({ summary: 'Listar parcelas de uma manutenção' })
  @Get(':id/parcelas')
  findParcelas(@Param('id') id: string) {
    return this.manutencaoService.findParcelas(+id);
  }

  @ApiOperation({ summary: 'Atualizar status de pagamento de uma parcela' })
  @Patch('parcela/:id')
  pagarParcela(@Param('id') id: string, @Body() updateParcelaDto: UpdateParcelaDto) {
    return this.manutencaoService.pagarParcela(+id, updateParcelaDto.pago);
  }

  @ApiOperation({ summary: 'Atualizar manutenção' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManutencaoDto: UpdateManutencaoDto) {
    return this.manutencaoService.update(+id, updateManutencaoDto);
  }

  @ApiOperation({ summary: 'Remover manutenção' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manutencaoService.remove(+id);
  }
}
