import { Injectable } from '@nestjs/common';
import { CreateDriveDirectoryDto } from './dto/create-drive-directory.dto';
import { UpdateDriveDirectoryDto } from './dto/update-drive-directory.dto';

@Injectable()
export class DriveDirectoryService {
  create(createDriveDirectoryDto: CreateDriveDirectoryDto) {
    return 'This action adds a new driveDirectory';
  }

  findAll() {
    return `This action returns all driveDirectory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} driveDirectory`;
  }

  update(id: number, updateDriveDirectoryDto: UpdateDriveDirectoryDto) {
    return `This action updates a #${id} driveDirectory`;
  }

  remove(id: number) {
    return `This action removes a #${id} driveDirectory`;
  }
}
