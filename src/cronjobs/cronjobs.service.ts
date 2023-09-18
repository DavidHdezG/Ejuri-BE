import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriveService } from '../drive/drive.service';
import { randomInt } from 'crypto';
@Injectable()
export class CronjobsService {
  constructor(private readonly driveService: DriveService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async readFolder() {

    try {
      console.log('downloadAllFiles')
      await this.driveService.downloadAllFiles();

      console.log('esperando 50 segundos')
      await new Promise(resolve => setTimeout(resolve, 50000));

      console.log('readTempFolder')
      await this.driveService.readTempFolder();
      console.log('Cron is running');
    } catch (error) {
      console.log(error.message);
    }
  }
}
