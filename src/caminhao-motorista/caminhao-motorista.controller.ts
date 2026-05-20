import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';
import { CreateCaminhaoMotoristaDto } from './dto/create-caminhao-motorista.dto';
import { UpdateCaminhaoMotoristaDto } from './dto/update-caminhao-motorista.dto';

@Controller('caminhao-motorista')
export class CaminhaoMotoristaController {
  constructor(private readonly caminhaoMotoristaService: CaminhaoMotoristaService) {}

  @Post()
  create(@Body() createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.create(createCaminhaoMotoristaDto);
  }

  @Get()
  findAll() {
    return this.caminhaoMotoristaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caminhaoMotoristaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    return this.caminhaoMotoristaService.update(+id, updateCaminhaoMotoristaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caminhaoMotoristaService.remove(+id);
  }
}
