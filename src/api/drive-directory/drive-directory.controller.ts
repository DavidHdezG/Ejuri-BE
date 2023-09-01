import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DriveDirectoryService } from './drive-directory.service';
import { CreateDriveDirectoryDto } from './dto/create-drive-directory.dto';
import { UpdateDriveDirectoryDto } from './dto/update-drive-directory.dto';

@Controller('drive-directory')
export class DriveDirectoryController {
  constructor(private readonly driveDirectoryService: DriveDirectoryService) {}

  @Post()
  create(@Body() createDriveDirectoryDto: CreateDriveDirectoryDto) {
    return this.driveDirectoryService.create(createDriveDirectoryDto);
  }

  @Get()
  findAll() {
    return this.driveDirectoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driveDirectoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriveDirectoryDto: UpdateDriveDirectoryDto) {
    return this.driveDirectoryService.update(+id, updateDriveDirectoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driveDirectoryService.remove(+id);
  }
}
