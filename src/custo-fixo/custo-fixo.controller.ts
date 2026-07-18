import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustoFixoService } from './custo-fixo.service';
import { CreateCustoFixoDto } from './dto/create-custo-fixo.dto';
import { UpdateCustoFixoDto } from './dto/update-custo-fixo.dto';
import { UpsertAjusteCustoFixoDto } from './dto/upsert-ajuste-custo-fixo.dto';

@ApiTags('custo-fixo')
@ApiBearerAuth()
@Controller('custo-fixo')
export class CustoFixoController {
  constructor(private readonly custoFixoService: CustoFixoService) {}

  @ApiOperation({ summary: 'Registrar custo fixo' })
  @Post()
  create(@Body() createCustoFixoDto: CreateCustoFixoDto) {
    return this.custoFixoService.create(createCustoFixoDto);
  }

  @ApiOperation({ summary: 'Listar todos os custos fixos' })
  @Get()
  findAll() {
    return this.custoFixoService.findAll();
  }

  @ApiOperation({ summary: 'Buscar custo fixo por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.custoFixoService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar custo fixo' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustoFixoDto: UpdateCustoFixoDto) {
    return this.custoFixoService.update(+id, updateCustoFixoDto);
  }

  @ApiOperation({ summary: 'Remover custo fixo' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.custoFixoService.remove(+id);
  }

  @ApiOperation({ summary: 'Listar ajustes de valor por mês de um custo fixo' })
  @Get(':id/ajustes')
  findAjustes(@Param('id') id: string) {
    return this.custoFixoService.findAjustes(+id);
  }

  @ApiOperation({ summary: 'Criar ou atualizar o ajuste de valor de um mês específico' })
  @Post(':id/ajustes')
  upsertAjuste(@Param('id') id: string, @Body() dto: UpsertAjusteCustoFixoDto) {
    return this.custoFixoService.upsertAjuste(+id, dto);
  }

  @ApiOperation({ summary: 'Remover o ajuste de um mês (volta a usar o valor padrão)' })
  @Delete('ajustes/:ajusteId')
  removeAjuste(@Param('ajusteId') ajusteId: string) {
    return this.custoFixoService.removeAjuste(+ajusteId);
  }
}
