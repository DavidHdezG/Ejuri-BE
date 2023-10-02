import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  @InjectRepository(Role)
  private readonly repository: Repository<Role>

  public async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role: Role = this.repository.create(createRoleDto);


    return await this.repository.save(role);
  }

  public async findAll(): Promise<Role[]> {
    console.log('RolesService.findAll')
    return await this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.repository.findOne({ where: { id: id } });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role: Role = await this.findOne(id);
    if (!role) {
      return new NotFoundException('Role not found');
    }
    Object.assign(role, updateRoleDto);
    return await this.repository.save(role);
  }

  async remove(id: number) {
    const role:Role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return await this.repository.remove(role);
  }
}
