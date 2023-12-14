import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { getEnvPath } from './common/helper/env.helper';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { ApiModule } from './api/api.module';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DriveModule } from './drive/drive.module';
import { AnnexGenerationService } from './annex-generation/annex-generation.service';
import { AnnexGenerationModule } from './annex-generation/annex-generation.module';
import { AnnexModule } from './api/pld/annex/annex.module';
import { AnnexCellModule } from './api/pld/annex-cell/annex-cell.module';
import { CellModule } from './api/pld/cell/cell.module';
import { HistoricModule } from './api/pld/historic/historic.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
    CronjobsModule,
    DriveModule,
    AnnexGenerationModule,
    AnnexModule,
    AnnexCellModule,
    CellModule,
    HistoricModule
  ],
  controllers: [AppController],
  providers: [AppService, AnnexGenerationService],
})
export class AppModule {}
