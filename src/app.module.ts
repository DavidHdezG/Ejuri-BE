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
const envFilePath:string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [ScheduleModule.forRoot(),UsersModule, ConfigModule.forRoot({ envFilePath, isGlobal: true }),
            TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService}),
            ApiModule,
            CronjobsModule,
            DriveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
