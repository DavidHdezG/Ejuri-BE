import { Controller, Get, Post, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AnnexGenerationService } from './annex-generation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import fs from 'fs';
@Controller('annex-generation')
export class AnnexGenerationController {
    constructor(private readonly appService: AnnexGenerationService) {}
    @Get()
    async getHello() {
        /* const list  = await this.appService.generateAnnex();
        return list; */
    }
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { dest: './uploads', preservePath: true  }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
        fs.rename(file.path, file.path + '.xlsx', function (err) {
            if (err) throw err;
            console.log('File Renamed.');
        }
        );
        const files = await this.appService.generateAnnex(file.path + '.xlsx');

        /* if(files.length>1){
            const zip = require('node-zip')();
            for (const item of files) {
                zip.file(item, fs.readFileSync(item));
            }
            const data = zip.generate({ base64: false, compression: 'DEFLATE' });
            fs.writeFileSync(file.path + '.zip', data, 'binary');
            return new StreamableFile(createReadStream(file.path + '.zip'));
        } */
        const newFile = createReadStream(files[0]);
        return new StreamableFile(newFile);
    }

}
