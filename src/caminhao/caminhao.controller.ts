import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createCaminhaoDto: CreateCaminhaoDto) {
    return this.caminhaoService.create(createCaminhaoDto);
  }

  @ApiOperation({ summary: 'Listar todos os caminhões' })
  @Get()
  findAll() {
    return this.caminhaoService.findAll();
  }

  @ApiOperation({ summary: 'Buscar caminhão por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caminhaoService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar caminhão' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaminhaoDto: UpdateCaminhaoDto) {
    return this.caminhaoService.update(+id, updateCaminhaoDto);
  }

  @ApiOperation({ summary: 'Remover caminhão' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caminhaoService.remove(+id);
  }
}
