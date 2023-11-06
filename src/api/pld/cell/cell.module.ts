import { Module } from '@nestjs/common';
import { CellService } from './cell.service';
import { CellController } from './cell.controller';
import { Cell } from './entities/cell.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Cell])],
  controllers: [CellController],
  providers: [CellService]
})
export class CellModule {}
