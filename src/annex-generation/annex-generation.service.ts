import { Inject, Injectable, Logger } from '@nestjs/common';
import { AnnexService } from 'src/api/pld/annex/annex.service';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import { DriveService } from 'src/drive/drive.service';
import { HistoricService } from 'src/api/pld/historic/historic.service';
import { User } from 'src/users/entities/user.entity';
import { Historic } from 'src/api/pld/historic/entities/historic.entity';
import { Annex } from 'src/api/pld/annex/entities/annex.entity';
class GeneratedFileData {
  private set: Set<any>;
  constructor() {
    this.set = new Set<any>();
  }

  addData(obj: { name: string; path: string }): void {
    const key = JSON.stringify({ name: obj.name, path: obj.path });
    if (!this.set.has(key)) {
      this.set.add(key);
    }
  }

  getData(): Array<{ name: string; path: string }> {
    return Array.from(this.set, (key) => JSON.parse(key));
  }
}
@Injectable()
export class AnnexGenerationService {
  constructor(
    @Inject(AnnexService) private readonly annexService: AnnexService,
    @Inject(DriveService) private readonly driveService: DriveService,
    @Inject(HistoricService) private readonly historicService: HistoricService,
  ) {}

  /* async generateAnnex(filePath: string, annexData: any) {
    const filesData = new GeneratedFileData();
    const file = await this.loadExcelFile(filePath);
    const annexList = await this.annexService.findAll();
    const annexListID = annexList.map((annex) => annex.id);
    for (const row of file) {
      let workbook = new ExcelJS.Workbook();
      let name =
        row[
          'Nombre Completo (apellido paterno, materno y nombre(s) sin abreviaturas) o Razón Social'
        ];
      workbook = await workbook.xlsx.readFile(__dirname + '/new.xlsx');

      if (annexData[name].length == 0) {
        continue;
      }

      for (const id of annexListID) {
        const annex = await this.annexService.findOne(id);

        let worksheet: ExcelJS.Worksheet = workbook.getWorksheet(annex.name);
        if (!worksheet) {
          continue;
        }
        if (!annexData[name].includes(annex.id)) {
          worksheet.state = 'hidden';
          continue;
        }
        let list = JSON.stringify(annex.annexCell, null, 2);
        let dlist = JSON.parse(list);

        for (const item of dlist) {
          if (row[item.cell.name]) {
            if (row[item.cell.name] instanceof Date) {
              worksheet.getCell(item.cell.cell).value =
                row[item.cell.name].toLocaleDateString();
              continue;
            }

            const temp = String(item.cell.cell).split('-');

            if (temp.length == 2) {
              if (row[item.cell.name] == 'Si') {
                worksheet.getCell(temp[0]).value = 'X';
              } else if (row[item.cell.name] == 'No') {
                worksheet.getCell(temp[1]).value = 'X';
              }
              continue;
            }
            if (temp.length == 3) {
              if (row[item.cell.name] == 'Alta') {
                worksheet.getCell(temp[2]).value = 'X';
              } else if (row[item.cell.name] == 'Media') {
                worksheet.getCell(temp[1]).value = 'X';
              } else if (row[item.cell.name] == 'Baja') {
                worksheet.getCell(temp[0]).value = 'X';
              }
              continue;
            }
            worksheet.getCell(item.cell.cell).value = row[item.cell.name];
          } else {
            Logger.debug(item.cell.name);
          }
        }

        const tempFileData = {
          name: name + '.xlsx',
          path: __dirname + '/' + name + '.xlsx',
        };

        filesData.addData(tempFileData);
      }

      await workbook.xlsx.writeFile(__dirname + '/' + name + '.xlsx');
    }
    const filesID = [];
    for (const filePath of filesData.getData()) {
      const id = await this.driveService.uploadExcelFile(
        filePath.path,
        filePath.name,
      );
      filesID.push({ id: id, name: filePath.name });
      fs.unlink(filePath.path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    
    return filesID;
  } */

  /**
   * Loads an Excel file and returns its data
   * @param fileName  - Name of the Excel file
   * @returns Promise<any>
   */
  async loadExcelFile(fileName: string): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx
      .readFile(fileName)
      .then(function () {
        const worksheet = workbook.getWorksheet(1); // Suponiendo que la hoja deseada es la primera (índice 1).

        const data = [];
        const headers = [];

        // Obtén los encabezados de la tabla
        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
          headers.push(cell.value);
        });

        // Recorre las filas de datos
        for (let row = 2; row <= worksheet.rowCount; row++) {
          const rowData = {};

          // Recorre las celdas en cada fila y crea un objeto
          worksheet
            .getRow(row)
            .eachCell({ includeEmpty: true }, (cell, colNumber) => {
              rowData[headers[colNumber - 1]] = cell.value;
            });

          data.push(rowData);
        }
        return data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // TESTING REESCRITURA DEL CODE
  /**
   * Generates the annexes of all clients in the Excel file
   * @param filePath  - Path of the Excel file
   * @param annexData  - Object that contains the annex IDs to be generated {name: string, annex: number[]}
   * @param user  - User that generated the annexes
   * @returns  Promise<any[]> - Array of Google Drive IDs
   */
  async generateAnnex(filePath: string, annexData: any, user: User) {
    /**
     * Object that contains the data of the generated files {name: string, path: string}
     * @type {GeneratedFileData}
     */
    const filesData: GeneratedFileData = new GeneratedFileData();
    /**
     * Excel file
     */
    const file = await this.loadExcelFile(filePath);
    /**
     * Array of all annexes in the database
     * @type {Annex[]}
     */
    const annexList: Annex[] = await this.annexService.findAll();
    /**
     * Array of annex IDs to be generated
     * @type {number[]} - Integer array
     */
    const annexListID: number[] = this.extractAnnexIDs(annexList);

    for (const row of file) {
      /**
       * Excel workbook
       * @type {ExcelJS.Workbook}
       */
      const workbook: ExcelJS.Workbook = await this.loadWorkbook();
      /**
       * Name of the client
       * @type {string}
       */
      const name: string = this.extractName(row);

      if (this.isAnnexDataEmpty(annexData[name])) {
        continue;
      }

      await this.processAnnexes(
        workbook,
        name,
        annexData[name],
        annexListID,
        filesData,
        row,
      );
    }
    const filesID = await this.uploadAndCleanup(filesData);
    for (const row of file) {
      const name = this.extractName(row);
      if (this.isAnnexDataEmpty(annexData[name])) {
        continue;
      }
      const driveId = filesID.find((file) => file.name == name + '.xlsx').id;
      await this.saveAnnexHistoric(name, row['No. de Cliente'], driveId, user);
    }
    return filesID;
  }

  /**
   * Saves the generated annexes in the database
   * @param name - Name of the client
   * @param clientNumber - Client number
   * @param driveId - Drive ID of the generated annexes
   * @param user  - User that generated the annexes
   * @returns Promise<Historic>
   */
  private async saveAnnexHistoric(
    name: string,
    clientNumber: string,
    driveId: string,
    user: User,
  ): Promise<Historic> {
    const res = await this.historicService.create({
      name: name,
      clientNumber: clientNumber,
      driveId: driveId,
      user: String(user.id),
    });
    return res;
  }

  /**
   * Extracts the IDs of the annexes
   * @param annexList - Array of annexes
   * @returns number[] - Integer array of annex IDs
   */
  private extractAnnexIDs(annexList: any[]): number[] {
    return annexList.map((annex) => annex.id);
  }

  /**
   * Loads the Excel workbook from the file
   * @returns ExcelJS.Workbook
   */
  private async loadWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(__dirname + '/new.xlsx');
  }

  /**
   * Extracts the name of the client it's related to
   * @param row  - Row of the Excel file
   * @returns  string - Name of the client
   */
  private extractName(row: any): string {
    return row[
      'Cliente al que está relacionado'
    ];
  }

  /**
   * Checks if  the client has annexes to be generated
   * @param annexData - Array of annex IDs
   * @returns boolean
   */
  private isAnnexDataEmpty(annexData: any[]): boolean {
    return annexData.length == 0;
  }

  /**
   * Generates the annexes of a client
   * @param workbook  - Excel workbook
   * @param name  - Name of the client
   * @param annexData  - Array of annex IDs to be generated
   * @param annexListID  - Array of all annex IDs
   * @param filesData  - Object that contains the data of the generated files {name: string, path: string}
   * @param row  - Row of the Excel file
   */
  private async processAnnexes(
    workbook: ExcelJS.Workbook,
    name: string,
    annexData: any[],
    annexListID: number[],
    filesData: GeneratedFileData,
    row: any,
  ): Promise<void> {
    for (const id of annexListID) {
      const annex = await this.annexService.findOne(id);

      const worksheet = workbook.getWorksheet(annex.name);

      if (!worksheet) {
        continue;
      }

      this.updateWorksheet(worksheet, annexData, row, annex);

      const tempFileData = {
        name: name + '.xlsx',
        path: __dirname + '/' + name + '.xlsx',
      };
      filesData.addData(tempFileData);
    }
    await workbook.xlsx.writeFile(__dirname + '/' + name + '.xlsx');
  }

  /**
   * Updates the worksheet of an annex
   * @param worksheet  - Excel worksheet
   * @param annexData  - Array of annex IDs to be generated
   * @param row  - Row of the Excel file
   * @param annex  - Annex object
   * @returns  void
   */
  private updateWorksheet(
    worksheet: ExcelJS.Worksheet,
    annexData: any[],
    row: any,
    annex: any,
  ): void {
    if (!annexData.includes(annex.id)) {
      worksheet.state = 'hidden';
      return;
    }
    const dlist = this.parseAnnexCell(annex.annexCell);

    for (const item of dlist) {
      if (row[item.cell.name]) {
        this.updateCell(worksheet, item, row);
      } else {
        Logger.debug(item.cell.name);
      }
    }
  }
  /**
   * Updates the cell of an annex worksheet according to its type
   * @param worksheet - Excel worksheet
   * @param item - Annex cell object
   * @param row - Row of the Excel file
   */
  private updateCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    if (row[item.cell.name] instanceof Date) {
      this.updateDateCell(worksheet, item, row);
    } else {
      const temp = String(item.cell.cell).split('-');

      if (temp.length == 2) {
        this.updateYesNoCell(worksheet, item, row, temp);
      } else if (temp.length == 3) {
        this.updateLevelCell(worksheet, item, row, temp);
      } else {
        this.updateDefaultCell(worksheet, item, row);
      }
    }
  }

  /**
   *  Updates the cell of an annex worksheet with a date
   * @param worksheet  - Excel worksheet
   * @param item  - Annex cell object
   * @param row  - Row of the Excel file
   */
  private updateDateCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    worksheet.getCell(item.cell.cell).value =
      /*                                                                                         */ row[
        item.cell.name
      ].toLocaleDateString();
  }

  /**
   *  Updates the cell of an annex worksheet with a Yes/No value
   * @param worksheet  - Excel worksheet
   * @param item  - Annex cell object
   * @param row  - Row of the Excel file
   * @param temp  - Array of cell names
   */
  private updateYesNoCell(
    worksheet: ExcelJS.Worksheet,
    item: any,
    row: any,
    temp: string[],
  ) {
    if (row[item.cell.name] == 'Si') {
      worksheet.getCell(temp[0]).value = 'X';
    } else if (row[item.cell.name] == 'No') {
      worksheet.getCell(temp[1]).value = 'X';
    }
  }

  /**
   *  Updates the cell of an annex worksheet with a level value
   * @param worksheet  - Excel worksheet
   * @param item  - Annex cell object
   * @param row  - Row of the Excel file
   * @param temp  - Array of cell names
   */
  private updateLevelCell(
    worksheet: ExcelJS.Worksheet,
    item: any,
    row: any,
    temp: string[],
  ) {
    if (row[item.cell.name] == 'Alta') {
      worksheet.getCell(temp[2]).value = 'X';
    } else if (row[item.cell.name] == 'Media') {
      worksheet.getCell(temp[1]).value = 'X';
    } else if (row[item.cell.name] == 'Baja') {
      worksheet.getCell(temp[0]).value = 'X';
    }
  }

  /**
   *  Updates the cell of an annex worksheet with a default value
   * @param worksheet  - Excel worksheet
   * @param item  - Annex cell object
   * @param row  - Row of the Excel file
   */
  private updateDefaultCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    worksheet.getCell(item.cell.cell).value = row[item.cell.name];
  }

  /**
   * Parses the annex cell object to an array
   * @param annexCell  - Annex cell object
   * @returns any[] - Array of annex cell objects
   */
  private parseAnnexCell(annexCell: any): any[] {
    const list = JSON.stringify(annexCell, null, 2);
    return JSON.parse(list);
  }

  /**
   * Uploads the generated files to Google Drive and deletes them
   * @param filesData  - Object that contains the data of the generated files {name: string, path: string}
   * @returns Promise<any[]> - Array of Google Drive IDs
   */
  private async uploadAndCleanup(filesData: GeneratedFileData): Promise<any[]> {
    const filesID = [];

    for (const filePath of filesData.getData()) {
      const id = await this.driveService.uploadExcelFile(
        filePath.path,
        filePath.name,
      );
      filesID.push({ id: id, name: filePath.name });

      this.unlinkFile(filePath.path);
    }

    return filesID;
  }

  /**
   * Deletes a file
   * @param filePath  - Path of the file
   */
  private unlinkFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
