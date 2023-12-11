import { Module, forwardRef } from '@nestjs/common';
import { DriveService } from './drive.service';
import { DocumentsModule } from 'src/api/documents/documents.module';
import { CategoryModule } from 'src/api/category/category.module';
import { DriveController } from './drive.controller';
import { ClientModule } from 'src/api/client/client.module';

@Module({
  imports: [forwardRef(() => ClientModule),CategoryModule, DocumentsModule],
  providers: [DriveService/* , CategoryService */],
  controllers: [DriveController],
  exports: [DriveService],
})
export class DriveModule {}
