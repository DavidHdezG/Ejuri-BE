import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
@ApiCookieAuth()
@Controller('annex')
@UseGuards(AuthGuard,RolesGuard)
export class AnnexController {
  constructor(private readonly annexService: AnnexService) {}

  @ApiResponse({ status: 200, description: 'Anexos encontrados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @Get()
  findAll() {
    return this.annexService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Anexo encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Anexo no encontrado' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annexService.findOne(+id);
  }
}
