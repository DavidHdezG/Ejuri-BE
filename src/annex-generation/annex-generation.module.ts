import { Module } from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { AnnexGenerationController } from './annex-generation.controller';
import { AnnexModule } from 'src/api/pld/annex/annex.module';
import { DriveModule } from 'src/drive/drive.module';
import { RolesModule } from 'src/users/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { HistoricModule } from 'src/api/pld/historic/historic.module';

@Module({
    imports: [AnnexModule,DriveModule,RolesModule,UsersModule, HistoricModule],
    providers:[AnnexGenerationService],
    controllers: [AnnexGenerationController]
})
export class AnnexGenerationModule {}
