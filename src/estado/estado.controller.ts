import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstadoService } from './estado.service';

@ApiTags('estado')
@ApiBearerAuth()
@Controller('estado')
export class EstadoController {
  constructor(private readonly estadoService: EstadoService) {}

  @ApiOperation({ summary: 'Listar todos os estados' })
  @Get()
  findAll() {
    return this.estadoService.findAll();
  }

  @ApiOperation({ summary: 'Buscar estado por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estadoService.findOne(+id);
  }
}
