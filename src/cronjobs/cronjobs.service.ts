import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriveService } from '../drive/drive.service';
import { randomInt } from 'crypto';
@Injectable()
export class CronjobsService {
  constructor(private readonly driveService: DriveService) {}
/* 
  @Cron(CronExpression.EVERY_5_MINUTES)
  async readFolder() {

    try {
      await this.driveService.downloadAllFiles();

      await new Promise(resolve => setTimeout(resolve, 5000));

      await this.driveService.readTempFolder();
    } catch (error) {
      console.log(error.message);
    }
  } */
}
