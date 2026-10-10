import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';
import { CreateCaminhaoMotoristaDto } from './dto/create-caminhao-motorista.dto';
import { UpdateCaminhaoMotoristaDto } from './dto/update-caminhao-motorista.dto';

@ApiTags('caminhao-motorista')
@ApiBearerAuth()
@Controller('caminhao-motorista')
export class CaminhaoMotoristaController {
  constructor(private readonly caminhaoMotoristaService: CaminhaoMotoristaService) {}

  @ApiOperation({ summary: 'Associar motorista a caminhão' })
  @Post()
  create(@EmpresaId() empresaId: number, @Body() createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.create(empresaId, createCaminhaoMotoristaDto);
  }

  @ApiOperation({ summary: 'Listar todas as associações' })
  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.caminhaoMotoristaService.findAll(empresaId);
  }

  @ApiOperation({ summary: 'Buscar associação por ID' })
  @Get(':id')
  findOne(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.caminhaoMotoristaService.findOne(empresaId, +id);
  }

  @ApiOperation({ summary: 'Atualizar associação' })
  @Patch(':id')
  update(@EmpresaId() empresaId: number, @Param('id') id: string, @Body() updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.update(empresaId, +id, updateCaminhaoMotoristaDto);
  }

  @ApiOperation({ summary: 'Remover associação' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.caminhaoMotoristaService.remove(empresaId, +id);
  }
}
