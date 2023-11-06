import { PartialType } from '@nestjs/swagger';
import { CreateAnnexDto } from './create-annex.dto';

export class UpdateAnnexDto extends PartialType(CreateAnnexDto) {}
