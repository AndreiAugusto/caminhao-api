import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { AbastecimentoService } from './abastecimento.service';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';
import { UpdateAbastecimentoDto } from './dto/update-abastecimento.dto';

@ApiTags('abastecimento')
@ApiBearerAuth()
@Controller('abastecimento')
export class AbastecimentoController {
  constructor(private readonly abastecimentoService: AbastecimentoService) {}

  @ApiOperation({ summary: 'Registrar abastecimento' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createAbastecimentoDto: CreateAbastecimentoDto) {
    return this.abastecimentoService.create(empresaId, createAbastecimentoDto);
  }

  @ApiOperation({ summary: 'Listar todos os abastecimentos (com dados do caminhão)' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.abastecimentoService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar abastecimento por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.abastecimentoService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar abastecimento' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateAbastecimentoDto: UpdateAbastecimentoDto) {
    return this.abastecimentoService.update(empresaId, +id, updateAbastecimentoDto);
  }

  @ApiOperation({ summary: 'Remover abastecimento' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.abastecimentoService.remove(empresaId, +id);
  }
}
