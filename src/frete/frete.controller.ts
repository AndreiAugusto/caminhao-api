import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createFreteDto: CreateFreteDto) {
    return this.freteService.create(createFreteDto);
  }

  @ApiOperation({ summary: 'Listar todos os fretes (com dados do motorista e caminhão)' })
  @Get()
  findAll() {
    return this.freteService.findAll();
  }

  @ApiOperation({ summary: 'Buscar frete por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.freteService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar frete' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFreteDto: UpdateFreteDto) {
    return this.freteService.update(+id, updateFreteDto);
  }

  @ApiOperation({ summary: 'Remover frete' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.freteService.remove(+id);
  }
}
