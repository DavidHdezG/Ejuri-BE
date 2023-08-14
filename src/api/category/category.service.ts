import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private readonly repository: Repository<Category>;

  create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category: Category = this.repository.create(createCategoryDto);

    return this.repository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.repository.find({where: {isDeleted: false}});
  }

  async findOne(id: string) {
    return this.repository.findOneBy({id: id});
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);
    return this.repository.save(category);
  }

  async remove(id: string): Promise<Category> {
    const category = await this.findOne(id);
    if( !category ){
      throw new NotFoundException('Category not found');
    }
    category.isDeleted = true;
    return this.repository.save(category);
  }
}
