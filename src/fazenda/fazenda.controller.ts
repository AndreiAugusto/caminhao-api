import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FazendaService } from './fazenda.service';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';

@ApiTags('fazenda')
@ApiBearerAuth()
@Controller('fazenda')
export class FazendaController {
  constructor(private readonly fazendaService: FazendaService) {}

  @ApiOperation({ summary: 'Cadastrar fazenda' })
  @Post()
  create(@Body() createFazendaDto: CreateFazendaDto) {
    return this.fazendaService.create(createFazendaDto);
  }

  @ApiOperation({ summary: 'Listar todas as fazendas' })
  @Get()
  findAll() {
    return this.fazendaService.findAll();
  }

  @ApiOperation({ summary: 'Buscar fazenda por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fazendaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar fazenda' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFazendaDto: UpdateFazendaDto) {
    return this.fazendaService.update(+id, updateFazendaDto);
  }

  @ApiOperation({ summary: 'Remover fazenda' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fazendaService.remove(+id);
  }
}
