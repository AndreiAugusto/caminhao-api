import { Injectable } from '@nestjs/common';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';

@Injectable()
export class ManutencaoService {
  create(createManutencaoDto: CreateManutencaoDto) {
    return 'This action adds a new manutencao';
  }

  findAll() {
    return `This action returns all manutencao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} manutencao`;
  }

  update(id: number, updateManutencaoDto: UpdateManutencaoDto) {
    return `This action updates a #${id} manutencao`;
  }

  remove(id: number) {
    return `This action removes a #${id} manutencao`;
  }
}
