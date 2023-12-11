import {
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'fs';
@Controller('annex-generation')
export class AnnexGenerationController {
  constructor(private readonly appService: AnnexGenerationService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { dest: './uploads', preservePath: true }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() annex: any,
  ) {
    fs.renameSync(file.path, file.path + '.xlsx');

    const id = await this.appService.generateAnnex(
      file.path + '.xlsx',
      JSON.parse(annex.annex),
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
