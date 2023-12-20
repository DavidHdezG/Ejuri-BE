import { Module } from '@nestjs/common';
import { HistoricService } from './pldhistoric.service';
import { HistoricController } from './pldhistoric.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/users/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pldhistoric } from './entities/pldhistoric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pldhistoric]),UsersModule,RolesModule],
  controllers: [HistoricController],
  providers: [HistoricService],
  exports: [HistoricService]
})
export class HistoricModule {}
