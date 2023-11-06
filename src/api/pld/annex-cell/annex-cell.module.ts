import { Module } from '@nestjs/common';
import { AnnexCellService } from './annex-cell.service';
import { AnnexCellController } from './annex-cell.controller';
import { AnnexCell } from './entities/annex-cell.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AnnexCell])],
  controllers: [AnnexCellController],
  providers: [AnnexCellService],
  exports: [AnnexCellService]
})
export class AnnexCellModule {}
