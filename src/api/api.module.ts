import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { QrhistoricModule } from './qrhistoric/qrhistoric.module';
import { DocumentsModule } from './documents/documents.module';
import { CategoryModule } from './category/category.module';
import { AnnexCellModule } from './pld/annex-cell/annex-cell.module';
import { AnnexModule } from './pld/annex/annex.module';
import { CellModule } from './pld/cell/cell.module';

@Module({
  imports: [ClientModule, QrhistoricModule, DocumentsModule, CategoryModule, AnnexModule, CellModule, AnnexCellModule]
})
export class ApiModule {}
