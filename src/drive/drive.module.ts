import { Module } from '@nestjs/common';
import { DriveService } from './drive.service';
import { DocumentsModule } from 'src/api/documents/documents.module';
import { ClientModule } from 'src/api/client/client.module';
import { CategoryModule } from 'src/api/category/category.module';
import { CategoryService } from 'src/api/category/category.service';

@Module({
  imports: [CategoryModule],
  providers: [DriveService/* , CategoryService */]
})
export class DriveModule {}
