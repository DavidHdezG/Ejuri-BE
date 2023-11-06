import { PartialType } from '@nestjs/swagger';
import { CreateCellDto } from './create-cell.dto';

export class UpdateCellDto extends PartialType(CreateCellDto) {}
