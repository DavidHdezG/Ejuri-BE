import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';
import { Annex } from './entities/annex.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from 'src/users/roles/roles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Annex]),RolesModule,UsersModule],
  controllers: [AnnexController],
  providers: [AnnexService],
  exports: [AnnexService]
})
export class AnnexModule {}
