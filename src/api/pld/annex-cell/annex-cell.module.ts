import { Module } from '@nestjs/common';
import { AnnexCellService } from './annex-cell.service';
import { AnnexCellController } from './annex-cell.controller';
import { AnnexCell } from './entities/annex-cell.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from 'src/users/roles/roles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnnexCell]),RolesModule,UsersModule],
  providers: [AnnexCellService],
  exports: [AnnexCellService]
})
export class AnnexCellModule {}
