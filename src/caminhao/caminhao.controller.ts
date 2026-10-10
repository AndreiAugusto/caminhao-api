import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { CaminhaoService } from './caminhao.service';
import { CreateCaminhaoDto } from './dto/create-caminhao.dto';
import { UpdateCaminhaoDto } from './dto/update-caminhao.dto';

@ApiTags('caminhao')
@ApiBearerAuth()
@Controller('caminhao')
export class CaminhaoController {
  constructor(private readonly caminhaoService: CaminhaoService) {}

  @ApiOperation({ summary: 'Cadastrar caminhão' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createCaminhaoDto: CreateCaminhaoDto) {
    return this.caminhaoService.create(empresaId, createCaminhaoDto);
  }

  @ApiOperation({ summary: 'Listar todos os caminhões' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.caminhaoService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar caminhão por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.caminhaoService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar caminhão' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateCaminhaoDto: UpdateCaminhaoDto) {
    return this.caminhaoService.update(empresaId, +id, updateCaminhaoDto);
  }

  @ApiOperation({ summary: 'Remover caminhão' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.caminhaoService.remove(empresaId, +id);
  }
}
