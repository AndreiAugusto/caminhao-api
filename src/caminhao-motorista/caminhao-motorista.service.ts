import { Injectable } from '@nestjs/common';
import { CreateCaminhaoMotoristaDto } from './dto/create-caminhao-motorista.dto';
import { UpdateCaminhaoMotoristaDto } from './dto/update-caminhao-motorista.dto';

@Injectable()
export class CaminhaoMotoristaService {
  create(createCaminhaoMotoristaDto: CreateCaminhaoMotoristaDto) {
    return 'This action adds a new caminhaoMotorista';
  }

  findAll() {
    return `This action returns all caminhaoMotorista`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caminhaoMotorista`;
  }

  update(id: number, updateCaminhaoMotoristaDto: UpdateCaminhaoMotoristaDto) {
    return `This action updates a #${id} caminhaoMotorista`;
  }

  remove(id: number) {
    return `This action removes a #${id} caminhaoMotorista`;
  }
}
