import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { QrhistoricModule } from './qrhistoric/qrhistoric.module';
import { DocumentsModule } from './documents/documents.module';
import { CategoryModule } from './category/category.module';
import { DriveDirectoryModule } from './drive-directory/drive-directory.module';

@Module({
  imports: [ClientModule, QrhistoricModule, DocumentsModule, CategoryModule, DriveDirectoryModule]
})
export class ApiModule {}
