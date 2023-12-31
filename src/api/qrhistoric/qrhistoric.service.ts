import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQrhistoricDto } from './dto/create-qrhistoric.dto';
import { UpdateQrhistoricDto } from './dto/update-qrhistoric.dto';
import { Repository } from 'typeorm';
import { Qrhistoric } from './entities/qrhistoric.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientService } from '../client/client.service';
import { Client } from '../client/entities/client.entity';

@Injectable()
export class QrhistoricService {
  @InjectRepository(Qrhistoric)
  private readonly repository: Repository<Qrhistoric>;
  constructor(private clientService:ClientService) {}
  public async create(
    createQrhistoricDto: CreateQrhistoricDto,
  ): Promise<Qrhistoric> {
    const client:Client = await this.clientService.findOne(
      createQrhistoricDto.client,
    );

    const qrhistoric: Qrhistoric = this.repository.create(createQrhistoricDto);
    console.log(qrhistoric);
    return await this.repository.save(qrhistoric);
  }

  public async findAll(): Promise<Qrhistoric[]> {
    return await this.repository.find({
      relations: ['client', 'document', 'category', 'user'],
      order: { id: 'DESC' },
      where: { isDeleted: false },
    });
  }

  public async findOne(id: number) {
    return await this.repository.findOne({ where: { id: id } });
  }

  public async update(id: number, updateQrhistoricDto: UpdateQrhistoricDto) {
    const qrhistoric = await this.findOne(id);
    if (!qrhistoric) {
      return new NotFoundException('Qrhistoric not found');
    }

    Object.assign(qrhistoric, updateQrhistoricDto);
    return await this.repository.save(qrhistoric);
  }

  public async remove(id: number): Promise<Qrhistoric> {
    const qrhistoric = await this.findOne(id);
    if (!qrhistoric) {
      throw new NotFoundException('Qrhistoric not found');
    }
    qrhistoric.isDeleted = true;
    return await this.repository.save(qrhistoric);
  }
}
