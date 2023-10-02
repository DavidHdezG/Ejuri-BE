import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { DriveService } from '../drive/drive.service';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from 'src/api/documents/documents.module';
import { ClientModule } from 'src/api/client/client.module';
import { CategoryModule } from 'src/api/category/category.module';

@Module({
  imports:[ConfigModule,CategoryModule, DocumentsModule],
  providers: [CronjobsService,DriveService]
})
export class CronjobsModule {}
