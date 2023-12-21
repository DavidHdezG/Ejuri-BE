import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { HistoricService } from './pldhistoric.service';
import { CreateHistoricDto } from './dto/create-historic.dto';
import { UpdateHistoricDto } from './dto/update-historic.dto';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
@ApiCookieAuth()
@Controller('pld/historic')
@UseGuards(AuthGuard, RolesGuard)
export class HistoricController {
  constructor(private readonly historicService: HistoricService) {}

  @ApiResponse({ status: 200, description: 'Historial registrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({status:500,description:'Error del servidor'})
  @Post()
  create(@Body() createHistoricDto: CreateHistoricDto) {
    return this.historicService.create(createHistoricDto);
  }

  @ApiResponse({ status: 200, description: 'Historiales encontrados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll() {
    return this.historicService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Historial encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historicService.findOne(+id);
  }

  @ApiResponse({ status: 200, description: 'Historial eliminado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @Roles(10)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historicService.remove(id);
  }
}
