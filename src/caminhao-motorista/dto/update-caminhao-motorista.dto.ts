import { PartialType } from '@nestjs/mapped-types';
import { CreateCaminhaoMotoristaDto } from './create-caminhao-motorista.dto';

export class UpdateCaminhaoMotoristaDto extends PartialType(CreateCaminhaoMotoristaDto) {}
