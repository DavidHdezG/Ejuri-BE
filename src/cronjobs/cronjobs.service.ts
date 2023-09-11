import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriveService } from '../drive/drive.service';
@Injectable()
export class CronjobsService {
  constructor(private readonly driveService: DriveService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async readFolder() {
    /*  const inputFilePath = __dirname+'/temp/1,4 Tarea de Desarrollo.pdf'; // Reemplaza con la ruta de tu archivo PDF de entrada
    const outputFilePath = __dirname + '/temp/Testfile.pdf'; // Reemplaza con la ruta donde deseas guardar el nuevo archivo PDF

    const file=await this.driveService.extraerYGuardarPaginaQR(inputFilePath, outputFilePath).catch((error) =>
      console.error('Error:', error),
    );
    console.log(file)
 */ /* await this.driveService.downloadAllFiles(); */
    /* const f= await this.driveService.readTempFolder(); */
    /* console.log(f) */
    try {
      console.log('downloadAllFiles')
      await this.driveService.downloadAllFiles();

      console.log('esperando 5 segundos')
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('readTempFolder')
      await this.driveService.readTempFolder();
      console.log('Cron is running');
    } catch (error) {
      console.log(error.message);
    }
    /* this.driveService.readTempFolder(); */
  }
}
