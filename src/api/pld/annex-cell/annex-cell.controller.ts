import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AnnexCellService } from './annex-cell.service';
import { CreateAnnexCellDto } from './dto/create-annex-cell.dto';
import { UpdateAnnexCellDto } from './dto/update-annex-cell.dto';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';

import { RolesGuard } from 'src/users/guards/roles.guard';
import { AuthGuard } from 'src/users/guards/auth.guard';
@ApiCookieAuth()
@UseGuards(AuthGuard,RolesGuard)
@Controller('annex-cell')
export class AnnexCellController {
  constructor(private readonly annexCellService: AnnexCellService) {}
  @ApiResponse({ status: 200, description: 'Relación encontradoa' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({status:500,description:'Error del servidor'})
  @Get()
  findAll() {
    return this.annexCellService.findAll();
  }

}
