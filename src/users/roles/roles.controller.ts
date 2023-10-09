import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
@ApiCookieAuth()
@UseGuards(AuthGuard,RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @ApiResponse({ status: 200, description: 'Rol creado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' }) 
  @Roles(10)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto):Promise<Role> {
    return await this.rolesService.create(createRoleDto);
  }
  @ApiResponse({ status: 200, description: 'Roles encontrados' }) 
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Roles(10)
  @Get()
  findAll() {
    console.log('RolesController.findAll')
    return this.rolesService.findAll();
  }
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Roles(10)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role =await this.rolesService.findOne(+id);
    if(!role){
      throw new NotFoundException('Role not found');
    }

    return role;
  }
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Roles(10)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }
  @ApiResponse({ status: 200, description: 'Rol eliminado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Roles(10)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
