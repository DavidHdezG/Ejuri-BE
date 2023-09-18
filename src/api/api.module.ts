import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { QrhistoricModule } from './qrhistoric/qrhistoric.module';
import { DocumentsModule } from './documents/documents.module';
import { CategoryModule } from './category/category.module';


@Module({
  imports: [ClientModule, QrhistoricModule, DocumentsModule, CategoryModule]
})
export class ApiModule {}
