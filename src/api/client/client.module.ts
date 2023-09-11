import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DriveService } from 'src/drive/drive.service';
import { DocumentsService } from '../documents/documents.service';
import { CategoryService } from '../category/category.service';
import { DocumentsModule } from '../documents/documents.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), CategoryModule],
  controllers: [ClientController],
  providers: [ClientService, DriveService]
})
export class ClientModule {}
