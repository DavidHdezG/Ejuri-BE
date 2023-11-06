import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnexCellService } from './annex-cell.service';
import { CreateAnnexCellDto } from './dto/create-annex-cell.dto';
import { UpdateAnnexCellDto } from './dto/update-annex-cell.dto';

@Controller('annex-cell')
export class AnnexCellController {
  constructor(private readonly annexCellService: AnnexCellService) {}

  @Post()
  create(@Body() createAnnexCellDto: CreateAnnexCellDto) {
    return this.annexCellService.create(createAnnexCellDto);
  }

  @Get()
  findAll() {
    return this.annexCellService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annexCellService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnexCellDto: UpdateAnnexCellDto) {
    return this.annexCellService.update(+id, updateAnnexCellDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.annexCellService.remove(+id);
  }
}
