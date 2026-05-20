import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ManutencaoService } from './manutencao.service';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';

@Controller('manutencao')
export class ManutencaoController {
  constructor(private readonly manutencaoService: ManutencaoService) {}

  @Post()
  create(@Body() createManutencaoDto: CreateManutencaoDto) {
    return this.manutencaoService.create(createManutencaoDto);
  }

  @Get()
  findAll() {
    return this.manutencaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manutencaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManutencaoDto: UpdateManutencaoDto) {
    return this.manutencaoService.update(+id, updateManutencaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manutencaoService.remove(+id);
  }
}
