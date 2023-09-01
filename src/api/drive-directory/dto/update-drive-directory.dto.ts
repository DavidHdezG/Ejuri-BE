import { PartialType } from '@nestjs/mapped-types';
import { CreateDriveDirectoryDto } from './create-drive-directory.dto';

export class UpdateDriveDirectoryDto extends PartialType(CreateDriveDirectoryDto) {}
