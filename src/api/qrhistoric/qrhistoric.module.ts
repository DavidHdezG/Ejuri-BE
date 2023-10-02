import { Module } from '@nestjs/common';
import { QrhistoricService } from './qrhistoric.service';
import { QrhistoricController } from './qrhistoric.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qrhistoric } from './entities/qrhistoric.entity';
import { RolesModule } from 'src/users/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { ClientModule } from '../client/client.module';


@Module({
  imports: [TypeOrmModule.forFeature([Qrhistoric]), RolesModule, UsersModule,
            ClientModule],
  controllers: [QrhistoricController],
  providers: [QrhistoricService]
})
export class QrhistoricModule {}
