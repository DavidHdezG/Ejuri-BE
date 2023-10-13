import { Inject, Injectable, forwardRef } from '@nestjs/common';
import jimp from 'jimp';
import jsqr from 'jsqr';
import { PDFDocument } from 'pdf-lib';
import { pdfToPng } from 'pdf-to-png-converter';
import { google } from 'googleapis';
import fs from 'fs';
import { CategoryService } from 'src/api/category/category.service';
import { DocumentsService } from 'src/api/documents/documents.service';
import { ClientService } from 'src/api/client/client.service';
import path from 'path';
import { promisify } from 'util';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

/**
 * Represents the structure of QR data for files.
 */
interface FinalData {
  category: number;
  name: string;
  folio: string;
  document: string;
  comments: string;
  useComments: boolean;
  date: string;
}

/**
 *  Service to interact with Google Drive API
 * 
 */

@Injectable()
export class DriveService {
  private readonly toMoveFolderId = '1-uBzk8Ny-mLijePleg02BJ8ROYAb94vr';
  private readonly failedFolder = '1-WRfT0tWalA0CLOTXS6ayaGxFmjD2V9r';
  private readonly buro = '1WWB8xOyMFAy-3Hg1ye5NDO155l4iItKL';
  /*   @Inject(ClientService)
  private readonly clientService: ClientService; */

  constructor(
    private readonly categoryService: CategoryService,
    private readonly documentService: DocumentsService,
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
  ) {}

  /**
   * Downloads all files from the drive folder and sends them to the trash only in Google Drive.
   * @returns Promise<void>
   */
  async downloadAllFiles(): Promise<void> {
    const files = await this.readDriveFolder();
    const rutaCarpeta = `${__dirname}/temp/`;

    if (!fs.existsSync(rutaCarpeta)) {
      fs.mkdirSync(rutaCarpeta, { recursive: true });
    }
    this.cleanTempFolder();
    const downloadPromises = files.map(async (item) => {
      const nombreArchivoDestino = item.name; // Cambia el nombre según lo que necesites
      const rutaCompletaArchivoDestino = `${__dirname}/temp/${nombreArchivoDestino}`;

      await this.downloadFile(item.id, rutaCompletaArchivoDestino);
      await this.sendFileToTrash(item.id);
    });

    // Esperar a que se completen todas las descargas y envíos a la papelera de reciclaje
    await Promise.all(downloadPromises);
    return;
  }

  /**
   * Uploads a file to a folder in Google Drive.
   * @param fileName Name of the file to upload.
   * @param filePath Path of the file to upload.
   * @param folderId Id of the folder where the file will be uploaded.
   * @returns Id of the uploaded file.
   */
  async uploadFile(
    fileName: string,
    filePath: string,
    folderId: string,
  ): Promise<string> {
    const archivoMetadata = {
      name: fileName + '.pdf',
      parents: [folderId],
    };

    const archivoMedia = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    const respuesta = await drive.files.create({
      requestBody: archivoMetadata,
      media: archivoMedia,
      fields: 'id', // Esto devuelve solo el ID del archivo creado
    });
    return respuesta.data.id;
  }

  /**
   * 
   * @returns List of files in the drive folder.
   */
  async readDriveFolder(): Promise<any> {
    try {
      const response = await drive.files.list({
        fields: 'files(id, name)' /* parents */,
        q: `'${this.toMoveFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      });
      return response.data.files;
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Downloads a file from Google Drive.
   * @param fileId Id of the file to download.
   * @param destinationPath Path where the file will be downloaded.
   * @returns Promise<void>
   */
  async downloadFile(fileId: string, destinationPath: string): Promise<void> {
    try {
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );
      const writeStream = fs.createWriteStream(destinationPath);
      response.data
        .on('end', () => {
          console.log('Archivo descargado con éxito.');
        })
        .on('error', (err: any) => {
          console.error('Error al descargar el archivo:', err);
        })
        .pipe(writeStream);
    } catch (error) {
      console.error('Error al obtener el archivo:', error);
    }
  }

  /**
   * Extracts the first page of a PDF file.
   * @param inputPath Path of the file to extract the page.
   * @returns Path of the file with the extracted page (QR).
   */
  async extractFirstPage(inputPath: string) {
    const inputData = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputData);

    pdfDoc.removePage(0);
    const old = await pdfDoc.save();
    fs.writeFileSync(inputPath, old);
    return inputPath;
  }

  /**
   * Extracts the QR from a PDF file.
   * @param inputPath Path of the file to extract the QR.
   * @returns Path of the png with the extracted page.
   */
  async extractQR(inputPath: string) {
    const qrPNG = await pdfToPng(inputPath, {
      outputFolder: __dirname + '/temp/',
      pagesToProcess: [1],
    });
    return qrPNG;
  }

  /**
   * Reads the QR code from a png file.
   * @param inputPath Path of the file to read the QR.
   * @returns The data of the QR.
   */
  async readQR(inputPath: string): Promise<string> {
    const imagen = await jimp.read(inputPath);
    const { data } = imagen.bitmap;
    const code = jsqr(
      new Uint8ClampedArray(data),
      imagen.bitmap.width,
      imagen.bitmap.height,
    );
    return code ? code.data : null;
  }


  /**
   * Reads the temp folder, process each file and uploads them to the corresponding folder in Google Drive.
   * @returns Promise<void>
   */
  async readTempFolder(): Promise<void> {
    try {
      console.log('Archivos locales');
      let fileIdDrive = '';
      const rutaCarpeta = `${__dirname}/temp/`;
      const files = fs.readdirSync(rutaCarpeta, { recursive: false });
      if (files.length === 0) {
        console.log('No hay archivos en la carpeta');
        return;
      }
      for (const item in files) {
        const inputPath = rutaCarpeta + files[item];

        const fileData = await this.extractQR(inputPath);

        const qrData = await this.readQR(fileData[0].path);

        let finalData: FinalData = JSON.parse(qrData);
        let fileName: string = '';
        if (finalData) {
          await this.extractFirstPage(inputPath);
          /* const category = await this.categoryService.findOne(
          finalData.category.toString(),
        ); */
          const document = await this.documentService.findOne(
            finalData.document,
          );
          fileName = `${finalData.folio} ${document.type}`;
          if (finalData.useComments) {
            fileName = fileName.concat(` ${finalData.comments}`);
          }
          fileName = fileName.concat(` ${finalData.date}`);

          // * Se sube también a la carpeta de buró general
          if (finalData.category === 4) {
            fileIdDrive = await this.uploadFile(fileName, inputPath, this.buro);
          }

          fileIdDrive = await this.uploadFile(
            fileName,
            inputPath,
            finalData.name,
          );
          
        } else {
          console.log('no qr item: ' + item);
          fileIdDrive = await this.uploadFile(
            files[item].toString().split('.pdf')[0],
            inputPath,
            this.failedFolder,
          );

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        console.log(fileIdDrive);

        // Se borran los archivos temporales locales creados
        fs.unlinkSync(inputPath);
        fs.unlinkSync(fileData[0].path);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Creates a folder in Google Drive.
   * @param folderName Name of the folder to create.
   * @param parentFolderId Id of the parent folder.
   * @returns Id of the created folder.
   */
  async createFolder(
    folderName: string,
    parentFolderId: string,
  ): Promise<string> {
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  /**
   * Sends a file to the trash in Google Drive.
   * @param fileId Id of the file to send to the trash.
   * @returns Promise<void>
   */
  async sendFileToTrash(fileId: string): Promise<void> {
    try {
      await drive.files.update({
        fileId: fileId,
        requestBody: {
          trashed: true,
        },
      });

      console.log('Archivo movido a la papelera de reciclaje con éxito.');
    } catch (error) {
      console.error(
        'Error al mover el archivo a la papelera de reciclaje:',
        error,
      );
    }
  }

  /**
   * Synchronizes the drive folders with the database.
   * @returns Promise<void>
   */
  async syncDriveFolders(): Promise<void> {
    try {
      console.log('Sincronizando carpetas...');
      let n = 0;
      const categories = await this.categoryService.findAll();
      for (const category of categories) {
        let folderId = category.driveId;
        let nextPageToken = null;
        const objList = [];

        do {
          const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'nextPageToken, files(id, name)',
            pageToken: nextPageToken,
          });

          for (const item in response.data.files) {
            const temp = {
              id: response.data.files[item].id,
              name: response.data.files[item].name,
              category: category,
              parentId: folderId,
            };
            const exist = await this.clientService.findOne(temp.id);
            if (!exist) {
              const client = await this.clientService.synchronize(
                temp.id,
                temp.category,
                temp.name,
              );
              console.log(client);
              n++;
            }
            objList.push(temp);
          }
          nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

      }
      if (n === 0) {
        console.log('No hay carpetas nuevas en el drive');
      }
    } catch (error) {
      console.log(error.message);
    }
  }


  /**
   * Moves all files from the temp folder to the error folder.
   */
  cleanTempFolder():void {
    const temp = `${__dirname}/temp/`;
    const error = `${__dirname}/error/`;
    if (!fs.existsSync(error)) {
      fs.mkdirSync(error, { recursive: true });
    }
    fs.readdir(temp,(err,files)=>{
      if(err){
        console.log(err)
      }
      files.forEach(file=>{
        const sourcePath=path.join(temp,file)
        const destPath=path.join(error,file)
  
        fs.rename(sourcePath,destPath,err=>{
          if(err){
            console.log(err)
          }
          console.log(`Archivo ${file} movido a ${destPath}`)
        })
      })
    })
  }
}
