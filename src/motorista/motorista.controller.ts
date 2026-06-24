import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  create(@Body() createMotoristaDto: CreateMotoristaDto) {
    return this.motoristaService.create(createMotoristaDto);
  }

  @ApiOperation({ summary: 'Listar todos os motoristas' })
  @Get()
  findAll() {
    return this.motoristaService.findAll();
  }

  @ApiOperation({ summary: 'Buscar motorista por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motoristaService.findOne(+id);
  }

  @ApiOperation({ summary: 'Atualizar motorista' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMotoristaDto: UpdateMotoristaDto) {
    return this.motoristaService.update(+id, updateMotoristaDto);
  }

  @ApiOperation({ summary: 'Remover motorista' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.motoristaService.remove(+id);
  }
}
