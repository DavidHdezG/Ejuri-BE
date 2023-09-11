import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DriveService } from 'src/drive/drive.service';

@Injectable()
export class ClientService {
  @InjectRepository(Client)
  private readonly repository: Repository<Client>;
  @Inject(DriveService)
  private readonly driveService: DriveService;


  public findAll(): Promise<Client[]> {
    return this.repository.find({
      where: { isDeleted: false },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  public findOne(id: string): Promise<Client> {
    return this.repository.findOneBy({ id: id });
  }


  // TODO: Probar la creación de carpetas con clientes nuevos
  public async create(folderName:string, parentFolderId:string): Promise<Client> {
    const idFolder = await this.driveService.createFolder(folderName,parentFolderId);
    const folder: CreateClientDto = {
      id: idFolder,
      name: folderName,
    };

    const client: Client = this.repository.create(folder);
    return this.repository.save(client);
  }

  public async update(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    const client: Client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, updateClientDto);
    return this.repository.save(client);
  }

  public async delete(id: string): Promise<Client> {
    const client: Client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    await this.repository.delete(id);
    Object.assign(client, {id: "___"+id ,isDeleted: true });
    return this.repository.save(client);
  }
}
