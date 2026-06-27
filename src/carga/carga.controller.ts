import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CargaService } from './carga.service';

@ApiTags('carga')
@ApiBearerAuth()
@Controller('carga')
export class CargaController {
  constructor(private readonly cargaService: CargaService) {}

  @ApiOperation({ summary: 'Listar todos os tipos de carga' })
  @Get()
  findAll() {
    return this.cargaService.findAll();
  }

  @ApiOperation({ summary: 'Buscar tipo de carga por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargaService.findOne(+id);
  }
}
