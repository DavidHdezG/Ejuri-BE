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
  create(createAnnexCellDto: CreateAnnexCellDto) {
    return 'This action adds a new annexCell';
  }

  async findAll() {
    return await this.annexCellRepository.find({relations: ['annex', 'cell']});
  }

  findOne(id: number) {
    return `This action returns a #${id} annexCell`;
  }

  update(id: number, updateAnnexCellDto: UpdateAnnexCellDto) {
    return `This action updates a #${id} annexCell`;
  }

  remove(id: number) {
    return `This action removes a #${id} annexCell`;
  }
}
