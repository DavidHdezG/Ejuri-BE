import { Module } from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { AnnexGenerationController } from './annex-generation.controller';
import { AnnexCell } from 'src/api/pld/annex-cell/entities/annex-cell.entity';
import { AnnexModule } from 'src/api/pld/annex/annex.module';
import { AnnexCellModule } from 'src/api/pld/annex-cell/annex-cell.module';

@Module({
    imports: [AnnexModule,AnnexCellModule],
    providers:[AnnexGenerationService],
    controllers: [AnnexGenerationController]
})
export class AnnexGenerationModule {}
