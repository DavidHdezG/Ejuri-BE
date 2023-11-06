import { PartialType } from '@nestjs/swagger';
import { CreateAnnexCellDto } from './create-annex-cell.dto';

export class UpdateAnnexCellDto extends PartialType(CreateAnnexCellDto) {}
