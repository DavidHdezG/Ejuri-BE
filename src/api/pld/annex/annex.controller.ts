import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { CreateAnnexDto } from './dto/create-annex.dto';
import { UpdateAnnexDto } from './dto/update-annex.dto';

@Controller('annex')
export class AnnexController {
  constructor(private readonly annexService: AnnexService) {}

  @Post()
  create(@Body() createAnnexDto: CreateAnnexDto) {
    return this.annexService.create(createAnnexDto);
  }

  @Get()
  findAll() {
    return this.annexService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.annexService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnexDto: UpdateAnnexDto) {
    return this.annexService.update(+id, updateAnnexDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.annexService.remove(+id);
  }
}
