import { Injectable, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from './roles/roles.service';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  constructor(private rolesService: RolesService) {}
  public async create(userdto: CreateUserDto): Promise<User> {
    const role = await this.rolesService.findOne(parseInt(userdto.roles));
    const data=Object.assign(userdto, { roles: role });
    
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  public async findOne(email: string): Promise<User> {
    return await this.repository.findOne({ where: { email: email, isDeleted:false } });
  }

  public async findOneById(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id: id }, relations: ['roles'] });
  }

  public async findAll(): Promise<User[]> {
    return await this.repository.find({ where: { isDeleted: false }, relations: ['roles'] });
  }

  public async findDeleted(): Promise<User[]> {
    return await this.repository.find({ where: { isDeleted: true } , relations: ['roles'] });
  }

  public async update(id: number, userdto:any): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, userdto);
    
    return await this.repository.save(user);
  }

  public async delete(id: number): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isDeleted = true;
    user.email= user.email + '-deleted';
    return await this.repository.save(user);
  }
}
