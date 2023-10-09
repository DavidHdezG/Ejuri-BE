import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { QrhistoricService } from './qrhistoric.service';
import { CreateQrhistoricDto } from './dto/create-qrhistoric.dto';
import { UpdateQrhistoricDto } from './dto/update-qrhistoric.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/users/interfaces/role.interface';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
@ApiCookieAuth()
@Controller('qrhistoric')
@UseGuards(AuthGuard, RolesGuard)
export class QrhistoricController {
  constructor(private readonly qrhistoricService: QrhistoricService) {}
  @ApiResponse({ status: 200, description: 'Historial registrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Post()
  create(@Body() createQrhistoricDto: CreateQrhistoricDto) {
    return this.qrhistoricService.create(createQrhistoricDto);
  }
  @ApiResponse({ status: 200, description: 'Historiales encontrados' })
  @Get()
  findAll() {
    return this.qrhistoricService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Historial encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const qrhistoric = await this.qrhistoricService.findOne(+id);
    if (!qrhistoric) {
      throw new NotFoundException('Qrhistoric not found');
    }
    return qrhistoric;
  }

  @ApiResponse({ status: 200, description: 'Historial actualizado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  @Roles(10)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQrhistoricDto: UpdateQrhistoricDto,
  ) {
    return this.qrhistoricService.update(+id, updateQrhistoricDto);
  }
  @ApiResponse({ status: 200, description: 'Historial eliminado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  @Roles(10)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrhistoricService.remove(+id);
  }
}
