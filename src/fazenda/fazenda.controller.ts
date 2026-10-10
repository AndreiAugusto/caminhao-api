import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { FazendaService } from './fazenda.service';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';
import { CreateFazendaContatoDto } from './dto/create-fazenda-contato.dto';

@ApiTags('fazenda')
@ApiBearerAuth()
@Controller('fazenda')
export class FazendaController {
  constructor(private readonly fazendaService: FazendaService) {}

  @ApiOperation({ summary: 'Cadastrar fazenda' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createFazendaDto: CreateFazendaDto) {
    return this.fazendaService.create(empresaId, createFazendaDto);
  }

  @ApiOperation({ summary: 'Listar todas as fazendas' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.fazendaService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar fazenda por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.fazendaService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar fazenda' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateFazendaDto: UpdateFazendaDto) {
    return this.fazendaService.update(empresaId, +id, updateFazendaDto);
  }

  @ApiOperation({ summary: 'Remover fazenda' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.fazendaService.remove(empresaId, +id);
  }

  @ApiOperation({ summary: 'Listar contatos de uma fazenda' })
  @Get(':id/contatos')
  findContatos(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.fazendaService.findContatos(empresaId, +id);
  }

  @ApiOperation({ summary: 'Adicionar um contato a uma fazenda' })
  @Post(':id/contatos')
  addContato(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() dto: CreateFazendaContatoDto) {
    return this.fazendaService.addContato(empresaId, +id, dto);
  }

  @ApiOperation({ summary: 'Remover um contato de uma fazenda' })
  @Delete('contatos/:contatoId')
  removeContato(@EmpresaId() empresaId: number, @Param('contatoId') contatoId: string) {
    return this.fazendaService.removeContato(empresaId, +contatoId);
  }
}
