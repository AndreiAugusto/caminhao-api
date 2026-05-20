import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaminhaoService } from './caminhao.service';
import { CreateCaminhaoDto } from './dto/create-caminhao.dto';
import { UpdateCaminhaoDto } from './dto/update-caminhao.dto';

@Controller('caminhao')
export class CaminhaoController {
  constructor(private readonly caminhaoService: CaminhaoService) {}

  @Post()
  create(@Body() createCaminhaoDto: CreateCaminhaoDto) {
    return this.caminhaoService.create(createCaminhaoDto);
  }

  @Get()
  findAll() {
    return this.caminhaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caminhaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaminhaoDto: UpdateCaminhaoDto) {
    return this.caminhaoService.update(+id, updateCaminhaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caminhaoService.remove(+id);
  }
}
