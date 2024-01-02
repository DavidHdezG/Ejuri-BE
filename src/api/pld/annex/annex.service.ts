import { Injectable } from '@nestjs/common';
import { CreateAnnexDto } from './dto/create-annex.dto';
import { UpdateAnnexDto } from './dto/update-annex.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Annex } from './entities/annex.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnnexService {
  @InjectRepository(Annex)
  private annexRepository: Repository<Annex>;

  async findAll() {
    const list = await this.annexRepository.find({
      relations: ['annexCell', 'annexCell.cell'],
      where: { available: true },
    });
    return list;
  }

  async findOne(id: number) {
    return await this.annexRepository.findOne({
      where: { id: id },
      relations: ['annexCell', 'annexCell.cell'],
    });
  }

  async findByName(name:string){
    return await this.annexRepository.findOne({
      where: { name: name },
      relations: ['annexCell', 'annexCell.cell'],
    });
  }
}
