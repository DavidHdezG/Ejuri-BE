import { Inject, Injectable } from '@nestjs/common';
import jimp from 'jimp';
import jsqr from 'jsqr';
import { PDFDocument, rgb } from 'pdf-lib';
import { pdfToPng } from 'pdf-to-png-converter';
import { google } from 'googleapis';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
import fs from 'fs';
import { CategoryService } from 'src/api/category/category.service';
import { DocumentsService } from 'src/api/documents/documents.service';
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});
const toMoveFolderId = '1-uBzk8Ny-mLijePleg02BJ8ROYAb94vr';
const failedFolder = '1-WRfT0tWalA0CLOTXS6ayaGxFmjD2V9r';
interface FinalData {
  category: number;
  name: string;
  folio: string;
  document: string;
  comments: string;
  useComments: boolean;
  date: string;
}

@Injectable()
export class DriveService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly documentService: DocumentsService,
  ) {}

  async downloadAllFiles(): Promise<void> {
    /* console.log("Descargando")
    const files = await this.readFolder();
    console.log(files)
    for (const item in files) {
      const nombreArchivoDestino = files[item].name; // Cambia el nombre según lo que necesites
      const rutaCompletaArchivoDestino = `${__dirname}/temp/${nombreArchivoDestino}`;
      const rutaCarpeta = `${__dirname}/temp/`;
      if (!fs.existsSync(rutaCarpeta))
        fs.mkdirSync(rutaCarpeta, { recursive: true });
      await this.downloadFile(files[item].id, rutaCompletaArchivoDestino);

      // TODO: SE MANDA EL ARCHIVO EN DRIVE A LA BASURA
      await this.sendFileToTrash(files[item].id);

    }
    return "listo" */

    const files = await this.readFolder();
    console.log(files);
    const rutaCarpeta = `${__dirname}/temp/`;

    if (!fs.existsSync(rutaCarpeta)) {
      fs.mkdirSync(rutaCarpeta, { recursive: true });
    }
    const downloadPromises = files.map(async (item) => {
      const nombreArchivoDestino = item.name; // Cambia el nombre según lo que necesites
      const rutaCompletaArchivoDestino = `${__dirname}/temp/${nombreArchivoDestino}`;

      await this.downloadFile(item.id, rutaCompletaArchivoDestino);
      await this.sendFileToTrash(item.id);
    });

    // Esperar a que se completen todas las descargas y envíos a la papelera de reciclaje
    await Promise.all(downloadPromises);
    console.log('ya jaja');
    return;
  }
  // ? Como subir los archivos a las carpetas correspondientes
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
  async readFolder(): Promise<any> {
    try {
      const response = await drive.files.list({
        fields: 'files(id, name)' /* parents */,
        q: `'${toMoveFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      });
      return response.data.files;
      /* for (let item in text) {
        console.log(text[item].id);
      } */
    } catch (error) {
      console.log(error.message);
    }
  }
  async downloadFile(fileId: string, destinationPath: string): Promise<void> {
    try {
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );
      /* const filePath = path.join(__dirname, fileName);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(response); */
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

  // ? Como le paso el archivo a tratar?
  async processFiles(): Promise<void> {
    await this.downloadAllFiles().then(async () => {
      await this.readTempFolder();
    });
  }
  async extraerYGuardarPaginaQR(inputPath: string) {
    // Leer el archivo PDF de entrada
    const inputData = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputData);

    pdfDoc.removePage(0);
    const old = await pdfDoc.save();

    const qrPNG = await pdfToPng(inputPath, {
      outputFolder: __dirname + '/temp/',
      pagesToProcess: [1],
    });
    /* fs.writeFileSync(outputPath, newPdfBytes); */
    fs.writeFileSync(inputPath, old);

    return { inputPath, qrPNG };
  }

  async extractFirstPage(inputPath: string) {
    const inputData = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputData);

    pdfDoc.removePage(0);
    const old = await pdfDoc.save();
    fs.writeFileSync(inputPath, old);
    return inputPath;
  }

  async extractQR(inputPath: string) {
    const qrPNG = await pdfToPng(inputPath, {
      outputFolder: __dirname + '/temp/',
      pagesToProcess: [1],
    });
    return qrPNG;
  }

  async readQR(inputPath: string): Promise<string> {
    const imagen = await jimp.read(inputPath);
    const { data } = imagen.bitmap;
    console.log(inputPath);
    const code = jsqr(
      new Uint8ClampedArray(data),
      imagen.bitmap.width,
      imagen.bitmap.height,
    );
    return code ? code.data : null;
  }

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
          console.log(JSON.parse(qrData));
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
            failedFolder,
          );

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        console.log(fileIdDrive);

        // * SE SUBE EL ARCHIVO

        // Se borran los archivos temporales locales creados
        fs.unlinkSync(inputPath);
        fs.unlinkSync(fileData[0].path);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

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

  async sendFileToTrash(fileId: string) {
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
}
