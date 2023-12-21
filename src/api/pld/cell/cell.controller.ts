import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CellService } from './cell.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

@Controller('cell')
export class CellController {
  constructor(private readonly cellService: CellService) {}

}
