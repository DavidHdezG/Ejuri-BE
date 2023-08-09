import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  public async create(userdto: CreateUserDto): Promise<User> {
    const user = this.repository.create(userdto);
    return await this.repository.save(user);
  }

  public async findOne(email: string): Promise<User> {
    return await this.repository.findOne({ where: { email: email } });
  }

  public async findOneById(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id: id } });
  }

  public async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  public async update(id: number, userdto: CreateUserDto): Promise<User> {
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
    return await this.repository.save(user);
  }
}
