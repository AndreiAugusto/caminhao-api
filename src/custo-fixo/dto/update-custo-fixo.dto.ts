import { PartialType } from '@nestjs/mapped-types';
import { CreateCustoFixoDto } from './create-custo-fixo.dto';

export class UpdateCustoFixoDto extends PartialType(CreateCustoFixoDto) {}
