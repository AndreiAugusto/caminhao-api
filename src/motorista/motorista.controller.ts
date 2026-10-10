import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { MotoristaService } from './motorista.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';

@ApiTags('motorista')
@ApiBearerAuth()
@Controller('motorista')
export class MotoristaController {
  constructor(private readonly motoristaService: MotoristaService) {}

  @ApiOperation({ summary: 'Cadastrar motorista' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createMotoristaDto: CreateMotoristaDto) {
    return this.motoristaService.create(empresaId, createMotoristaDto);
  }

  @ApiOperation({ summary: 'Listar todos os motoristas' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.motoristaService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar motorista por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.motoristaService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar motorista' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateMotoristaDto: UpdateMotoristaDto) {
    return this.motoristaService.update(empresaId, +id, updateMotoristaDto);
  }

  @ApiOperation({ summary: 'Remover motorista' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.motoristaService.remove(empresaId, +id);
  }
}
