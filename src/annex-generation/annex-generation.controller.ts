import {
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'fs';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
@ApiCookieAuth()
@Controller('annex-generation')
@UseGuards(AuthGuard, RolesGuard)
export class AnnexGenerationController {
  constructor(private readonly appService: AnnexGenerationService) {}

  @ApiResponse({ status: 200, description: 'Anexos generados' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 500, description: 'Error al generar los anexos' })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { dest: './uploads', preservePath: true }),
    ClassSerializerInterceptor
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() annex: any,
    @CurrentUser() user: User
  ) {
    fs.renameSync(file.path, file.path + '.xlsx');

    const id = await this.appService.generateAnnex(
      file.path + '.xlsx',
      JSON.parse(annex.annex),
      user
    );
    fs.unlink(file.path + '.xlsx', (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return id;
  }
}
