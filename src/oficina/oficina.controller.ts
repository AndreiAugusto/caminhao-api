import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createOficinaDto: CreateOficinaDto) {
    return this.oficinaService.create(createOficinaDto);
  }

  @ApiOperation({ summary: 'Listar todas as oficinas' })
  @Get()
  findAll() {
    return this.oficinaService.findAll();
  }

  @ApiOperation({ summary: 'Buscar oficina por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oficinaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar oficina' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOficinaDto: UpdateOficinaDto) {
    return this.oficinaService.update(+id, updateOficinaDto);
  }

  @ApiOperation({ summary: 'Remover oficina' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oficinaService.remove(+id);
  }
}
