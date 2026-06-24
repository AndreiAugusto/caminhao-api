import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createAbastecimentoDto: CreateAbastecimentoDto) {
    return this.abastecimentoService.create(createAbastecimentoDto);
  }

  @ApiOperation({ summary: 'Listar todos os abastecimentos (com dados do caminhão)' })
  @Get()
  findAll() {
    return this.abastecimentoService.findAll();
  }

  @ApiOperation({ summary: 'Buscar abastecimento por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abastecimentoService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar abastecimento' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAbastecimentoDto: UpdateAbastecimentoDto) {
    return this.abastecimentoService.update(+id, updateAbastecimentoDto);
  }

  @ApiOperation({ summary: 'Remover abastecimento' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.abastecimentoService.remove(+id);
  }
}
