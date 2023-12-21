import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriveService } from '../drive/drive.service';
import { randomInt } from 'crypto';
@Injectable()
export class CronjobsService {
  constructor(private readonly driveService: DriveService) {}

  /**
   * Cron job to read the temp folder and move the files to the correct folder in Google Drive
   */
/*   @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async readFolder() {

    this.driveService
      .downloadAllFilesFromGoogleDrive()
      .then(async () => {
        Logger.debug('Descarga completa de archivos. Ejecutando ordenamiento...', 'CronjobsService');
        await new Promise(resolve => setTimeout(resolve, 15000))
        return this.driveService.readTempFolder();
      })
      .then(() => {
        Logger.debug('Ordenamiento terminado', 'CronjobsService');
      })
      .catch((error) => {
        Logger.error(error, 'CronjobsService');
      });
  } */

  /**
   * Cron job to sync the folders in Google Drive with the database
   */
  /* @Cron(CronExpression.EVERY_MINUTE)
  async syncDriveFolders() {
    try {
      await this.driveService.syncDriveFolders();
    } catch (error) {
      console.error(error);
    }
  } */
}
