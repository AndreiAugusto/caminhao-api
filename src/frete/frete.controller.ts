import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { FreteService } from './frete.service';
import { CreateFreteDto } from './dto/create-frete.dto';
import { UpdateFreteDto } from './dto/update-frete.dto';

@ApiTags('frete')
@ApiBearerAuth()
@Controller('frete')
export class FreteController {
  constructor(private readonly freteService: FreteService) {}

  @ApiOperation({ summary: 'Registrar frete' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createFreteDto: CreateFreteDto) {
    return this.freteService.create(empresaId, createFreteDto);
  }

  @ApiOperation({ summary: 'Listar todos os fretes (com dados do motorista e caminhão)' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.freteService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar frete por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.freteService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar frete' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateFreteDto: UpdateFreteDto) {
    return this.freteService.update(empresaId, +id, updateFreteDto);
  }

  @ApiOperation({ summary: 'Remover frete' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.freteService.remove(empresaId, +id);
  }
}
