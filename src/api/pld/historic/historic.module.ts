import { Module } from '@nestjs/common';
import { HistoricService } from './historic.service';
import { HistoricController } from './historic.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/users/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historic } from './entities/historic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Historic]),UsersModule,RolesModule],
  controllers: [HistoricController],
  providers: [HistoricService],
  exports: [HistoricService]
})
export class HistoricModule {}
