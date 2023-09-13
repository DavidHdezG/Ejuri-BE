import { Inject, Injectable } from '@nestjs/common';
import path from 'path';
import jimp from 'jimp';
import jsqr from 'jsQR';
import { PDFDocument, rgb } from 'pdf-lib';
import { pdfToPng } from 'pdf-to-png-converter';
import { google } from 'googleapis';
const CLIENT_ID =
  '513836203875-vm90lgm5caqs3u838s9b4olfkvnpp095.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =
  '1//04wuXAzmVznYqCgYIARAAGAQSNwF-L9IrJnToRPXj6_7pti9W1JX6UwU04dxEoDd_EC70mVm8SSfbSbE_hhX6UnbbSha1YdbrsGo';
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
import fs from 'fs';
import { CategoryService } from 'src/api/category/category.service';
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});
const toMoveFolderId = '1-uBzk8Ny-mLijePleg02BJ8ROYAb94vr';

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
  constructor(private readonly categoryService: CategoryService) {}

  async downloadAllFiles(): Promise<void> {
    const files = await this.readFolder();
    for (const item in files) {
      const nombreArchivoDestino = files[item].name; // Cambia el nombre según lo que necesites
      const rutaCompletaArchivoDestino = `${__dirname}/temp/${nombreArchivoDestino}`;
      const rutaCarpeta = `${__dirname}/temp/`;
      if (!fs.existsSync(rutaCarpeta))
        fs.mkdirSync(rutaCarpeta, { recursive: true });
      await this.downloadFile(files[item].id, rutaCompletaArchivoDestino);
    }
  }
  // ? Como subir los archivos a las carpetas correspondientes?
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
        q: `'${toMoveFolderId}' in parents and trashed = false`,
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

    // Crear un nuevo documento solo con la primera página
    // const firstPage = pdfDoc.getPages()[0];

    // const newPdfDoc = await PDFDocument.create();
    // const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
    // newPdfDoc.addPage(copiedPage);
    pdfDoc.removePage(0);
    const old = await pdfDoc.save();
    // Guardar el nuevo documento con la primera página en un archivo
    // const newPdfBytes = await newPdfDoc.save();

    const qrPNG = await pdfToPng(inputPath, {
      outputFolder: __dirname + '/temp/',
      pagesToProcess: [1],
    });
    /* fs.writeFileSync(outputPath, newPdfBytes); */
    fs.writeFileSync(inputPath, old);

    // ⁄Parsear el PDF para extraer texto e imágenes

    return { inputPath, qrPNG };
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
    // TODO: parsear a JSON
    return code ? code.data : null;
  }

  async readTempFolder(): Promise<void> {
    const rutaCarpeta = `${__dirname}/temp/`;
    const files = fs.readdirSync(rutaCarpeta, { recursive: false });
    for (const item in files) {
      console.log(files[item]);
      const inputPath = rutaCarpeta + files[item];

      const fileData = await this.extraerYGuardarPaginaQR(inputPath);

      const qrData = await this.readQR(fileData.qrPNG[0].path);
      // TODO: PASAR UN JSON CON LA INFO Y YA MANEJARLA AQUí
      // * If

      let finalData: FinalData = JSON.parse(qrData);

      if (finalData) {
        const categoryFolder = await this.categoryService.findOne(
          finalData.category.toString(),
        );
            
      }
      console.log(JSON.parse(qrData));
      // Se borran los archivos temporales locales creados
      fs.unlinkSync(inputPath);
      fs.unlinkSync(fileData.qrPNG[0].path);
    }
  }

  async createFolder(
    folderName: string,
    parentFolderId: string,
  ): Promise<string> {
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId], // Si deseas que la carpeta esté dentro de otra carpeta
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }
}
