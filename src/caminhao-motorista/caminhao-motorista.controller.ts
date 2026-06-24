import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.create(createCaminhaoMotoristaDto);
  }

  @ApiOperation({ summary: 'Listar todas as associações' })
  @Get()
  findAll() {
    return this.caminhaoMotoristaService.findAll();
  }

  @ApiOperation({ summary: 'Buscar associação por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caminhaoMotoristaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar associação' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.update(+id, updateCaminhaoMotoristaDto);
  }

  @ApiOperation({ summary: 'Remover associação' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caminhaoMotoristaService.remove(+id);
  }
}
