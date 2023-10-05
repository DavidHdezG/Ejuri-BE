import { Controller, Post } from '@nestjs/common';
import { DriveService } from './drive.service';

@Controller('drive')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Post()
  async test() {
    this.driveService
      .downloadAllFiles()
      .then(async () => {
        console.log('Descarga completa. Ejecutando readTempFolder()...');
        await new Promise(resolve => setTimeout(resolve, 5000))
        return this.driveService.readTempFolder();
      })
      .then(() => {
        console.log('readTempFolder() completada.');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  @Post('trigger')
  async trigger() {
    await this.driveService.syncDriveFolders();
  }

}
