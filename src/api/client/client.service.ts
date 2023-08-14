import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  @InjectRepository(Client)
  private readonly repository: Repository<Client>;

  public findAll(): Promise<Client[]> {
    return this.repository.find({ where: { isDeleted: false } });
  }

  public findOne(id: number): Promise<Client> {
    return this.repository.findOneBy({ id: id });
  }

  public create(body: CreateClientDto): Promise<Client> {
    const client: Client = this.repository.create(body);
    return this.repository.save(client);
  }

  public async update(
    id: number,
    updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    const client: Client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, updateClientDto);
    return this.repository.save(client);
  }

  public async delete(id: number): Promise<Client> {
    const client: Client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    client.isDeleted = true;
    return this.repository.save(client);
  }
}
