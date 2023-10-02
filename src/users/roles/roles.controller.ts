import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto):Promise<Role> {
    return await this.rolesService.create(createRoleDto);
  }
  @Get()
  findAll() {
    console.log('RolesController.findAll')
    return this.rolesService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role =await this.rolesService.findOne(+id);
    if(!role){
      throw new NotFoundException('Role not found');
    }

    return role;
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
