import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CellService } from './cell.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

@Controller('cell')
export class CellController {
  constructor(private readonly cellService: CellService) {}

  @Post()
  create(@Body() createCellDto: CreateCellDto) {
    return this.cellService.create(createCellDto);
  }

  @Get()
  findAll() {
    return this.cellService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cellService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCellDto: UpdateCellDto) {
    return this.cellService.update(+id, updateCellDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cellService.remove(+id);
  }
}
