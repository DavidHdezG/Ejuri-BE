import { Module, forwardRef } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DriveService } from 'src/drive/drive.service';
import { DocumentsService } from '../documents/documents.service';
import { CategoryService } from '../category/category.service';
import { DocumentsModule } from '../documents/documents.module';
import { CategoryModule } from '../category/category.module';
import { RolesModule } from 'src/users/roles/roles.module';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { DriveModule } from 'src/drive/drive.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), CategoryModule, RolesModule, UsersModule, DocumentsModule,forwardRef(() => DriveModule)],
  controllers: [ClientController],
  providers: [ClientService/* , DriveService */],
  exports: [ClientService],
})
export class ClientModule {}
