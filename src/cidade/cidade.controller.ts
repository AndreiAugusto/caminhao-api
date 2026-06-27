import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CidadeService } from './cidade.service';

@ApiTags('cidade')
@ApiBearerAuth()
@Controller('cidade')
export class CidadeController {
  constructor(private readonly cidadeService: CidadeService) {}

  @ApiOperation({ summary: 'Listar todas as cidades' })
  @Get()
  findAll() {
    return this.cidadeService.findAll();
  }

  @ApiOperation({ summary: 'Buscar cidade por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cidadeService.findOne(+id);
  }
}
