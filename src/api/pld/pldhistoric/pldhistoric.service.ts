import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHistoricDto } from './dto/create-historic.dto';
import { UpdateHistoricDto } from './dto/update-historic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pldhistoric } from './entities/pldhistoric.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoricService {
  @InjectRepository(Pldhistoric)
  private readonly repository: Repository<Pldhistoric>;
  async create(createHistoricDto: CreateHistoricDto) {
    const historic: Pldhistoric = this.repository.create(createHistoricDto);
    return await this.repository.save(historic);
  }

  async findAll() {
    return await this.repository.find({
      relations: ['user'],
      order: { id: 'DESC' },
    })
  }

  async findOne(id: number) {
    return  await this.repository.findOne({where:{id:id}})
  }

  update(id: number, updateHistoricDto: UpdateHistoricDto) {
    return `This action updates a #${id} historic`;
  }

  async remove(id: string) {
    const historic = await this.findOne(Number(id));
    if(!historic){
      throw new NotFoundException('Historic not found');
    }
    return await this.repository.remove(historic);
  }
}
