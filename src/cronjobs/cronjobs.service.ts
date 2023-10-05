import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriveService } from '../drive/drive.service';
import { randomInt } from 'crypto';
@Injectable()
export class CronjobsService {
  constructor(private readonly driveService: DriveService) {}

  /* @Cron(CronExpression.EVERY_5_MINUTES)
  async readFolder() {

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
  } */
  @Cron(CronExpression.EVERY_MINUTE)
  async syncDriveFolders() {
    try {
      await this.driveService.syncDriveFolders();
    } catch (error) {
      console.error(error);
    }
  }
}
