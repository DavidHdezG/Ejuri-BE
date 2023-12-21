import { Injectable } from '@nestjs/common';
import { CreateAnnexCellDto } from './dto/create-annex-cell.dto';
import { UpdateAnnexCellDto } from './dto/update-annex-cell.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnnexCell } from './entities/annex-cell.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnnexCellService {
  @InjectRepository(AnnexCell)
  private annexCellRepository: Repository<AnnexCell>;

  async findAll() {
    return await this.annexCellRepository.find({relations: ['annex', 'cell']});
  }
}
