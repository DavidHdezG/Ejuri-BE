import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './interfaces/role.interface';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  public async create(userdto: CreateUserDto): Promise<User> {
    const user = this.repository.create(userdto);
    return await this.repository.save(user);
  }

  public async findOne(email: string): Promise<User> {
    return await this.repository.findOne({ where: { email: email, isDeleted:false } });
  }

  public async findOneById(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id: id } });
  }

  public async findAll(): Promise<User[]> {
    return await this.repository.find({ where: { isDeleted: false } });
  }

  public async findDeleted(): Promise<User[]> {
    return await this.repository.find({ where: { isDeleted: true } });
  }

  public async update(id: number, userdto: UpdateUserDto): Promise<User> {
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
