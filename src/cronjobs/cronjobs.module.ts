import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { DriveService } from '../drive/drive.service';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from 'src/api/documents/documents.module';
import { ClientModule } from 'src/api/client/client.module';
import { CategoryModule } from 'src/api/category/category.module';
import { DriveModule } from 'src/drive/drive.module';

@Module({
  imports:[ConfigModule,CategoryModule, DocumentsModule,ClientModule,DriveModule],
  providers: [CronjobsService/* ,DriveService */],
  exports: [CronjobsService],
})
export class CronjobsModule {}
