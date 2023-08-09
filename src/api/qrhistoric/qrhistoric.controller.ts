import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QrhistoricService } from './qrhistoric.service';
import { CreateQrhistoricDto } from './dto/create-qrhistoric.dto';
import { UpdateQrhistoricDto } from './dto/update-qrhistoric.dto';

@Controller('qrhistoric')
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
  findOne(@Param('id') id: string) {
    return this.qrhistoricService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQrhistoricDto: UpdateQrhistoricDto) {
    return this.qrhistoricService.update(+id, updateQrhistoricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrhistoricService.remove(+id);
  }
}
