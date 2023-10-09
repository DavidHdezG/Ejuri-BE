import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/users/interfaces/role.interface';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
@ApiCookieAuth()
@Controller('documents')
@UseGuards(AuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}
  @ApiResponse({ status: 200, description: 'Documento creado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }
  @ApiResponse({ status: 200, description: 'Documentos encontrados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  @ApiResponse({ status: 200, description: 'Documento actualizado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, updateDocumentDto);
  }
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @Roles(10)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
