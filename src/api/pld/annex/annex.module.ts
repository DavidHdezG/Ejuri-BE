import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';
import { Annex } from './entities/annex.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Annex])],
  controllers: [AnnexController],
  providers: [AnnexService],
  exports: [AnnexService]
})
export class AnnexModule {}
