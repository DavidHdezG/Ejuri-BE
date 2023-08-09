import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
@Injectable()
export class DocumentsService {
  @InjectRepository(Document)
  private readonly repository: Repository<Document>;

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const document: Document = this.repository.create(createDocumentDto);

    return await this.repository.save(document);
  }

  findAll(): Promise<Document[]> {
    return this.repository.find({
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }

  findOne(id: string): Promise<Document> {
    return this.repository.findOne({
      where: { id: id },
      relations: ['category'],
    });
  }

  public async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);
    if (!document) {
      return new NotFoundException('Document not found');
    }

    Object.assign(document, updateDocumentDto);
    return await this.repository.save(document);
  }

  public async remove(id: string): Promise<DeleteResult> {
    const document = await this.findOne(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return await this.repository.delete(id);
  }
}
