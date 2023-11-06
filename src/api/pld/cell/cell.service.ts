import { Injectable } from '@nestjs/common';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

@Injectable()
export class CellService {
  create(createCellDto: CreateCellDto) {
    return 'This action adds a new cell';
  }

  findAll() {
    return `This action returns all cell`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cell`;
  }

  update(id: number, updateCellDto: UpdateCellDto) {
    return `This action updates a #${id} cell`;
  }

  remove(id: number) {
    return `This action removes a #${id} cell`;
  }
}
