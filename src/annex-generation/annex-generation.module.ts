import { Module } from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { AnnexGenerationController } from './annex-generation.controller';
import { AnnexCell } from 'src/api/pld/annex-cell/entities/annex-cell.entity';
import { AnnexModule } from 'src/api/pld/annex/annex.module';
import { AnnexCellModule } from 'src/api/pld/annex-cell/annex-cell.module';
import { DriveService } from 'src/drive/drive.service';
import { DriveModule } from 'src/drive/drive.module';

@Module({
    imports: [AnnexModule,DriveModule],
    providers:[AnnexGenerationService],
    controllers: [AnnexGenerationController]
})
export class AnnexGenerationModule {}
