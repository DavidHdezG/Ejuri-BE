import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DriveService } from 'src/drive/drive.service';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class ClientService {
  @InjectRepository(Client)
  private readonly repository: Repository<Client>;
  @Inject(DriveService)
  private readonly driveService: DriveService;
  @Inject(CategoryService)
  private readonly categoryService: CategoryService;
  

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

  /**
   * Create a client in the database if exist in the drive
   * @param id 
   * @param category 
   * @param name 
   * @returns Client
   */
  public async synchronize(id:string,category:Category,name:string): Promise<Client> {
    const folder : CreateClientDto = {
      id: id,
      name: name,
    };
    const client: Client = this.repository.create(folder);
    client.category = category;
    return await this.repository.save(client);
  }

  /**
   * Create a client in the drive and in the database if client doesn't exist
   * @param createClientDto 
   * @returns Client
   */
  public async create(createClientDto: CreateClientDto): Promise<Client> {
    const folderName:string= createClientDto.name;
    const parentFolderId :string= createClientDto.id;
    const idFolder = await this.driveService.createFolder(folderName,parentFolderId);
    const category = await this.categoryService.findByDriveId(parentFolderId);
    const folder: CreateClientDto = {
      id: idFolder,
      name: createClientDto.name,
    };

    const client: Client = this.repository.create(folder);
    client.category = category;
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
