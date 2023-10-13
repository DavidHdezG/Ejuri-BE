import { PartialType } from '@nestjs/swagger';
import { CreateQrhistoricDto } from './create-qrhistoric.dto';

export class UpdateQrhistoricDto extends PartialType(CreateQrhistoricDto) {}
