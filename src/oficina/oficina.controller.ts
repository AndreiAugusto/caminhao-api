import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { OficinaService } from './oficina.service';
import { CreateOficinaDto } from './dto/create-oficina.dto';
import { UpdateOficinaDto } from './dto/update-oficina.dto';

@ApiTags('oficina')
@ApiBearerAuth()
@Controller('oficina')
export class OficinaController {
  constructor(private readonly oficinaService: OficinaService) {}

  @ApiOperation({ summary: 'Cadastrar oficina' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createOficinaDto: CreateOficinaDto) {
    return this.oficinaService.create(empresaId, createOficinaDto);
  }

  @ApiOperation({ summary: 'Listar todas as oficinas' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.oficinaService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar oficina por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.oficinaService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar oficina' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateOficinaDto: UpdateOficinaDto) {
    return this.oficinaService.update(empresaId, +id, updateOficinaDto);
  }

  @ApiOperation({ summary: 'Remover oficina' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.oficinaService.remove(empresaId, +id);
  }
}
