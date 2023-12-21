import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import jimp from 'jimp';
import jsqr from 'jsqr';
import { PDFDocument } from 'pdf-lib';
import { pdfToPng } from 'pdf-to-png-converter';
import { drive_v3, google } from 'googleapis';
import fs from 'fs';
import { CategoryService } from 'src/api/category/category.service';
import { DocumentsService } from 'src/api/documents/documents.service';
import { ClientService } from 'src/api/client/client.service';
import path from 'path';
import { Document } from 'src/api/documents/entities/document.entity';

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
  private readonly toMoveFolderId = process.env.TO_MOVE_FOLDER_ID;
  private readonly failedFolder = process.env.FAILED_FOLDER_ID;
  private readonly successfulFolder = process.env.SUCCESSFUL_FOLDER_ID;
  private readonly buro = process.env.BURO_FOLDER_ID;
  private readonly pldExcelFolder = process.env.PLD_EXCEL_FOLDER_ID;
  private readonly CLIENT_ID = process.env.CLIENT_ID;
  private readonly CLIENT_SECRET = process.env.CLIENT_SECRET;
  private readonly REDIRECT_URI = process.env.REDIRECT_URI;
  private readonly REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  private drive: drive_v3.Drive;
  private readonly oauth2Client = new google.auth.OAuth2(
    this.CLIENT_ID,
    this.CLIENT_SECRET,
    this.REDIRECT_URI,
  );

  /*   @Inject(ClientService)
  private readonly clientService: ClientService; */

  constructor(
    private readonly categoryService: CategoryService,
    private readonly documentService: DocumentsService,
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
  ) {
    this.oauth2Client.setCredentials({ refresh_token: this.REFRESH_TOKEN });
    this.drive = google.drive({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  /**
   * Downloads all files from the drive folder and sends them to the trash, only in Google Drive.
   * @returns Promise<void>
   */
  async downloadAllFilesFromGoogleDrive(): Promise<void> {
    /**
     * Read the drive folder and store the files in an array.
     * @type {Array}
     *
     */
    const files: any = await this.readDriveFolder();
    /**
     * Temp folder to store the downloaded files.
     * @type {string}
     */
    const tempFolder: string = `${__dirname}/temp/`;

    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }
    /**
     * If any lagging file is found, send it to the trash.
     */
    this.cleanTempFolder();
    /**
     * Download all files from the drive folder.
     */
    const downloadPromises = files.map(
      async (item: { name: any; id: string }) => {
        const fileName = item.name;
        const filePath = `${__dirname}/temp/${fileName}`;

        await this.downloadFile(item.id, filePath);
        this.moveFile(item.id);
      },
    );

    /**
     * Wait for all files to be downloaded.
     */
    await Promise.all(downloadPromises);
    return;
  }

  /**
   * Moves a file from one folder to another in Google Drive.
   * @param fileId Id of the file to move.
   */
  async moveFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.update({
        fileId: fileId,
        removeParents: this.toMoveFolderId,
        addParents: this.successfulFolder,
      });
    } catch (error) {
      Logger.error(error.message, 'DriveService - moveFile');
    }
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
    /**
     * Metadata of the file to upload.
     * @type {object: {name: string, parents: string[]}
     */
    const fileMetadata: object = {
      name: fileName + '.pdf',
      parents: [folderId],
    };

    /**
     * Media info of the file to upload.
     * @type {object: {mimeType: string, body: any}
     */
    const archivoMedia: object = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    /**
     * Uploads the file to Google Drive and returns the id of the uploaded file.
     */
    const res = await this.drive.files.create({
      requestBody: fileMetadata,
      media: archivoMedia,
      fields: 'id',
    });
    return res.data.id;
  }

  /**
   *
   * @returns List of files in the drive folder.
   */
  async readDriveFolder(): Promise<any> {
    try {
      /**
       * List of files in the drive folder and returns the id and name of each file.
       */
      const res = await this.drive.files.list({
        fields: 'files(id, name)',
        q: `'${this.toMoveFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      });
      return res.data.files;
    } catch (error) {
      Logger.error(error.message, 'DriveService');
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
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );
      const writeStream = fs.createWriteStream(destinationPath);
      response.data
        .on('end', () => {})
        .on('error', (err: any) => {
          Logger.error(
            'Error al descargar el archivo: '.concat(err),
            'Driver Service - Download File',
          );
        })
        .pipe(writeStream);
    } catch (error) {
      Logger.error(
        'Error al obtener el archivo: '.concat(error),
        'Driver Service - Download File',
      );
    }
  }

  /**
   * Remove the first page (QR) of a PDF file and write the result PDF.
   * @param inputPath Path of the file to extract the page.
   * @returns Path of the file with the extracted page (QR).
   */
  async extractFirstPage(inputPath: string) {
    /**
     * Reads the file to extract the page.
     * @type {Buffer}
     */
    const inputData: Buffer = fs.readFileSync(inputPath);
    /**
     * Loads the file
     * @type {PDFDocument}
     */
    const pdfDoc: PDFDocument = await PDFDocument.load(inputData);

    pdfDoc.removePage(0);
    /**
     * Save the file with the first page removed.
     */
    const res = await pdfDoc.save();
    fs.writeFileSync(inputPath, res);
    return inputPath;
  }

  /**
   * Extracts the QR from a PDF file and save it as a png file.
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
   * Reads a QR code from a png file.
   * @param inputPath Path of the file to read the QR.
   * @returns Promise<string> Data of the QR.
   */
  async readQR(inputPath: string): Promise<string> {
    const image = await jimp.read(inputPath);
    const { data } = image.bitmap;
    const code = jsqr(
      new Uint8ClampedArray(data),
      image.bitmap.width,
      image.bitmap.height,
    );
    return code ? code.data : null;
  }

  /**
   * Reads the temp folder, process each file and uploads them to the corresponding folder in Google Drive.
   * @returns Promise<void>
   */
  /*   async readTempFolder(): Promise<void> {
    try {
      let fileIdDrive = '';
      const folderPath = `${__dirname}/temp/`;
      const files = fs.readdirSync(folderPath, { recursive: false });
      if (files.length === 0) {
        Logger.log(
          'No hay archivos en la carpeta',
          'DriveService - readTempFolder',
        );
        return;
      }
      for (const item in files) {
        const inputPath = folderPath + files[item];

        const fileData = await this.extractQR(inputPath);

        const qrData = await this.readQR(fileData[0].path);

        let finalData: FinalData = JSON.parse(qrData);
        let fileName: string = '';
        if (finalData) {
          await this.extractFirstPage(inputPath);

          const document = await this.documentService.findOne(
            finalData.document,
          );

          if(document.type != 'Otro'){
            fileName = `${finalData.folio} ${document.type}`;
          }else{
            fileName = `${finalData.folio}`;
          }

          if (finalData.useComments) {
            fileName = fileName.concat(` ${finalData.comments}`);
          }

          // * Se sube también a la carpeta de buró general
          if (finalData.category === 4 || document.type === 'Carta Buró') {
            const buroFileName = `Copia de ${finalData.folio}`;
            fileIdDrive = await this.uploadFile(
              buroFileName,
              inputPath,
              this.buro,
            );
          }

          fileIdDrive = await this.uploadFile(
            fileName,
            inputPath,
            finalData.name,
          );
        } else {
          Logger.error(
            'no qr item: '.concat(item),
            'Driver Service - readTempFolder',
          );
          fileIdDrive = await this.uploadFile(
            files[item].toString().split('.pdf')[0],
            inputPath,
            this.failedFolder,
          );

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        // Delete the file from the temp folder
        fs.unlinkSync(inputPath);
        fs.unlinkSync(fileData[0].path);
      }
    } catch (error) {
      Logger.error(error.message, 'DriveService - readTempFolder');
    }
  } */

  /**
   *  Reads the temp folder and process each file.
   * @returns  Promise<void>
   */
  async readTempFolder(): Promise<void> {
    try {
      /**
       * Path of the temp folder.
       * @type {string}
       */
      const folderPath: string = `${__dirname}/temp/`;
      /**
       * List of files in the temp folder.
       * @type {Array}
       */
      const files: Array<any> = fs.readdirSync(folderPath, {
        recursive: false,
      });
      if (files.length === 0) {
        Logger.log(
          'No hay archivos en la carpeta',
          'DriveService - readTempFolder',
        );
        return;
      }

      for (const item in files) {
        /**
         * Path of the file to process.
         * @type {string}
         */
        const inputPath: string = folderPath + files[item];
        await this.processFile(inputPath, item);
      }
    } catch (error) {
      Logger.error(error.message, 'DriveService - readTempFolder');
    }
  }

  /**
   * Process a file from the temp folder. Extracts the QR, reads it and handles the data. Finally, removes the temp files.
   * @param item - Index of the file in the temp folder.
   */
  async processFile(inputPath: string, item: string) {
    const fileData = await this.extractQR(inputPath);
    const qrData = await this.readQR(fileData[0].path);
    let finalData: FinalData = JSON.parse(qrData);
    if (finalData) {
      await this.handleFinalData(inputPath, finalData);
    } else {
      await this.handleNoQRItem(inputPath, item);
    }

    fs.unlinkSync(inputPath);
    fs.unlinkSync(fileData[0].path);
  }

  /**
   *  Handles the data of a file from the temp folder and uploads the file to GoogleDrive.
   * @param inputPath - Path of the file to process.
   * @param fileData  - Data of the QR.
   */
  async handleFinalData(inputPath: string, fileData: FinalData): Promise<void> {
    await this.extractFirstPage(inputPath);
    const document: Document = await this.documentService.findOne(
      fileData.document,
    );
    let fileName: string = this.getFileName(fileData, document);
    if (fileData.category === 4 || document.type === 'Carta Buró') {
      const buroFileName = `Copia de ${fileData.folio}`;
      await this.uploadFile(buroFileName, inputPath, this.buro);
    }
    await this.uploadFile(fileName, inputPath, fileData.name);
  }

  /**
   * Gets the name of the file to upload to Google Drive.
   * @param finalData - Data of the QR.
   * @param document - Document type of the file.
   * @returns
   */
  getFileName(finalData: FinalData, document: any): string {
    if (!finalData) {
      return '';
    }

    let fileName: string =
      document.type != 'Otro'
        ? `${finalData.folio} ${document.type}`
        : `${finalData.folio}`;
    return finalData.useComments
      ? `${fileName} ${finalData.comments}`
      : fileName;
  }

  /**
   * Handles a file from the temp folder without a QR.
   * @param inputPath - Path of the file to process.
   * @param item - Index of the file in the temp folder.
   */
  async handleNoQRItem(inputPath: string, item: string): Promise<void> {
    Logger.error(
      'no qr item: '.concat(item),
      'Driver Service - readTempFolder',
    );
    await this.uploadFile(
      inputPath.toString().split('/').pop().split('.pdf')[0],
      inputPath,
      this.failedFolder,
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
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

    const folder = await this.drive.files.create({
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
      await this.drive.files.update({
        fileId: fileId,
        requestBody: {
          trashed: true,
        },
      });
      /*       console.log('Archivo movido a la papelera de reciclaje con éxito.'); */
    } catch (error) {
      Logger.error(error.message, 'DriveService - sendFileToTrash');
    }
  }

  /**
   * Synchronizes the drive folders with the database.
   * @returns Promise<void>
   */
  async syncDriveFolders(): Promise<void> {
    try {
      Logger.debug(
        'Sincronizando carpetas...',
        'DriveService - syncDriveFolders',
      );
      let n = 0;
      const categories = await this.categoryService.findAll();
      for (const category of categories) {
        let folderId = category.driveId;
        let nextPageToken = null;
        const objList = [];

        do {
          const response = await this.drive.files.list({
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
              /*               console.log(client); */
              n++;
            }
            objList.push(temp);
          }
          nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);
      }
      if (n === 0) {
        Logger.log('No hay carpetas nuevas', 'DriveService - syncDriveFolders');
      }
    } catch (error) {
      Logger.error(error.message, 'DriveService - syncDriveFolders');
    }
  }

  /**
   * Moves all files from the temp folder to the error folder.
   */
  cleanTempFolder(): void {
    const temp = `${__dirname}/temp/`;
    const error = `${__dirname}/error/`;
    if (!fs.existsSync(error)) {
      fs.mkdirSync(error, { recursive: true });
    }
    fs.readdir(temp, (err, files) => {
      if (err) {
        Logger.error(err.message, 'DriveService - cleanTempFolder');
      }
      files.forEach((file) => {
        const sourcePath = path.join(temp, file);
        const destPath = path.join(error, file);

        fs.rename(sourcePath, destPath, (err) => {
          if (err) {
            Logger.error(err.message, 'DriveService - cleanTempFolder');
          }
          Logger.log(
            `Archivo ${file} movido a ${destPath}`,
            'DriveService - cleanTempFolder',
          );
        });
      });
    });
  }

  async uploadExcelFile(filePath: string, fileName: string) {
    const archivoMetadata = {
      name: fileName,
      parents: [this.pldExcelFolder],
    };

    const archivoMedia = {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: fs.createReadStream(filePath),
    };

    const respuesta = await this.drive.files.create({
      requestBody: archivoMetadata,
      media: archivoMedia,
      fields: 'id', // Esto devuelve solo el ID del archivo creado
    });
    return respuesta.data.id;
  }
}
