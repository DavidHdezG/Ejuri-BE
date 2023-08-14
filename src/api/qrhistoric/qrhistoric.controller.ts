import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { QrhistoricService } from './qrhistoric.service';
import { CreateQrhistoricDto } from './dto/create-qrhistoric.dto';
import { UpdateQrhistoricDto } from './dto/update-qrhistoric.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/users/interfaces/role.interface';

@Controller('qrhistoric')
@UseGuards(AuthGuard,RolesGuard)
export class QrhistoricController {
  constructor(private readonly qrhistoricService: QrhistoricService) {}

  @Post()
  create(@Body() createQrhistoricDto: CreateQrhistoricDto) {
    return this.qrhistoricService.create(createQrhistoricDto);
  }

  @Get()
  findAll() {
    return this.qrhistoricService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const qrhistoric=await this.qrhistoricService.findOne(+id);
    if(!qrhistoric){
      throw new NotFoundException('Qrhistoric not found');
    }
    return qrhistoric;
  }
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQrhistoricDto: UpdateQrhistoricDto) {
    return this.qrhistoricService.update(+id, updateQrhistoricDto);
  }
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrhistoricService.remove(+id);
  }
}
