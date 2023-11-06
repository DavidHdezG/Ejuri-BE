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
  create(createAnnexDto: CreateAnnexDto) {
    return 'This action adds a new annex';
  }

  async findAll() {
    const list = await this.annexRepository.find({
      relations: ['annexCell', 'annexCell.cell'],
    });
    return list;

    /* return await this.annexRepository.createQueryBuilder("annex").getMany(); */
  }

  async findOne(id: number) {
    return await this.annexRepository.findOne({
      where: { id: id },
      relations: ['annexCell', 'annexCell.cell'],
    });
  }

  update(id: number, updateAnnexDto: UpdateAnnexDto) {
    return `This action updates a #${id} annex`;
  }

  remove(id: number) {
    return `This action removes a #${id} annex`;
  }
}
