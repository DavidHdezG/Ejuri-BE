import { Module } from '@nestjs/common';
import { DriveDirectoryService } from './drive-directory.service';
import { DriveDirectoryController } from './drive-directory.controller';

@Module({
  controllers: [DriveDirectoryController],
  providers: [DriveDirectoryService]
})
export class DriveDirectoryModule {}
