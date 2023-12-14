import { PartialType } from '@nestjs/swagger';
import { CreateHistoricDto } from './create-historic.dto';

export class UpdateHistoricDto extends PartialType(CreateHistoricDto) {}
