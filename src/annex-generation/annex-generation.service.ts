import { Inject, Injectable, Logger } from '@nestjs/common';
import { AnnexService } from 'src/api/pld/annex/annex.service';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import { DriveService } from 'src/drive/drive.service';
import { HistoricService } from 'src/api/pld/pldhistoric/pldhistoric.service';
import { User } from 'src/users/entities/user.entity';
import { Pldhistoric } from 'src/api/pld/pldhistoric/entities/pldhistoric.entity';
import { Annex } from 'src/api/pld/annex/entities/annex.entity';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
/**
 * Object that contains the data of the generated files {name: string, path: string, client: string}
 */
class GeneratedFileData {
  private set: Set<any>;
  constructor() {
    this.set = new Set<any>();
  }

  /**
   * Adds data to the set
   * @param obj - {name: string, path: string, client: string}
   */
  addData(obj: { name: string; path: string; client: string }): void {
    const key = JSON.stringify({
      name: obj.name,
      path: obj.path,
      client: obj.client,
    });
    if (!this.set.has(key)) {
      this.set.add(key);
    }
  }

  /**
   * Returns the data of the set as an array
   * @returns Array<{name: string, path: string, client: string}>
   */
  getData(): Array<{ name: string; path: string; client: string }> {
    return Array.from(this.set, (key) => JSON.parse(key));
  }
}
@Injectable()
export class AnnexGenerationService {
  constructor(
    @Inject(AnnexService) private readonly annexService: AnnexService,
    @Inject(DriveService) private readonly driveService: DriveService,
    @Inject(HistoricService) private readonly historicService: HistoricService,
  ) {
    if(!fs.existsSync(__dirname + '/new.xlsx')){
      this.driveService.downloadFile(process.env.PLD_EXCEL_TEMPLATE_ID,__dirname+ '/new.xlsx');
      Logger.debug("PLD Annex template downloaded");
    }

  }

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
        const worksheet = workbook.getWorksheet(1); 

        const data = [];
        const headers = [];

        worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
          headers.push(cell.value);
        });

        for (let row = 2; row <= worksheet.rowCount; row++) {
          const rowData = {};

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
      const client: string = this.extractClient(row);
      if (annexData[name] == undefined) {
        continue;
      }
      if (this.isAnnexDataEmpty(annexData[name])) {
        continue;
      }

      await this.processAnnexes(
        workbook,
        name,
        client,
        annexData[name],
        annexListID,
        filesData,
        row,
      );
    }
    const mergedFilesData = await this.mergeByClient(filesData);
    const filesID = await this.uploadAndCleanup(mergedFilesData);
    for (const file of filesID) {
      this.saveAnnexHistoric(file.name, file.id, user);
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
    companyName: string,
    driveId: string,
    user: User,
  ): Promise<Pldhistoric> {
    const res = await this.historicService.create({
      companyName: companyName,
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
   * Extracts the name of the client
   * @param row  - Row of the Excel file
   * @returns  string - Name of the client
   */
  private extractName(row: any): string {
    return row[
      'Nombre Completo (apellido paterno, materno y nombre(s) sin abreviaturas) o Razón Social'
    ];
  }
  /**
   * Extracts the name of the client it's related to
   * @param row  - Row of the Excel file
   * @returns  string - Name of the client
   */
  private extractClient(row: any): string {
    return row['Cliente al que está relacionado'];
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
   * @param client - Name of the client it's related to
   * @param annexData  - Array of annex IDs to be generated
   * @param annexListID  - Array of all annex IDs
   * @param filesData  - Object that contains the data of the generated files {name: string, path: string}
   * @param row  - Row of the Excel file
   */
  private async processAnnexes(
    workbook: ExcelJS.Workbook,
    name: string,
    client: string,
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
        client: client,
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
    if (item.cell.name == 'Fecha') {
      this.updatePlaceAndDateCell(worksheet, item, row);
    } else if (row[item.cell.name] instanceof Date) {
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
   * Formats a date to the format "dd 'de' MMMM 'de' yyyy" (es)
   * @param date - Date to be formatted
   * @returns
   */
  private formatDate(date: Date): string {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  }

  /**
   * Updates the cell of an annex worksheet with a place and date value
   * @param worksheet - Excel worksheet
   * @param item - Annex cell object
   * @param row - Row of the Excel file
   */
  private updatePlaceAndDateCell(
    worksheet: ExcelJS.Worksheet,
    item: any,
    row: any,
  ) {
    const date = this.formatDate(row[item.cell.name]).toUpperCase();
    const place = row['Lugar'].toUpperCase();
    worksheet.getCell(item.cell.cell).value = place + ' A ' + date;
  }

  /**
   *  Updates the cell of an annex worksheet with a date
   * @param worksheet  - Excel worksheet
   * @param item  - Annex cell object
   * @param row  - Row of the Excel file
   */
  private updateDateCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    worksheet.getCell(item.cell.cell).value =
      row[item.cell.name].toLocaleDateString();
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
    const cellText = row[item.cell.name].toLowerCase();
    if (cellText == 'si') {
      worksheet.getCell(temp[0]).value = 'X';
    } else if (cellText == 'no') {
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
    const cellText = row[item.cell.name].toLowerCase();
    if (cellText == 'alta') {
      worksheet.getCell(temp[2]).value = 'X';
    } else if (cellText == 'media') {
      worksheet.getCell(temp[1]).value = 'X';
    } else if (cellText == 'baja') {
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
        'PLD ' + filePath.name,
      );
      filesID.push({ id: id, name: 'PLD ' + filePath.name });

      this.unlinkFile(filePath.path);
    }

    return filesID;
  }

  /**
   * Sends to merge the generated files by client and returns the path of the merged files
   * @param filesData - Object that contains the data of the generated files {name: string, path: string, client: string}
   * @returns
   */
  private async mergeByClient(
    filesData: GeneratedFileData,
  ): Promise<GeneratedFileData> {
    const mergedData = new GeneratedFileData();
    const files = filesData.getData();
    const clients = this.extractClients(files);
    for (const client of clients) {
      const clientFiles = files.filter((file) => file.client == client);
      const mergedFile = await this.mergeFiles(clientFiles);
      mergedData.addData({ name: client, path: mergedFile, client: client });
    }
    return mergedData;
  }

  /**
   *  Extracts the clients from the generated files
   * @param files  - Array of generated files data {name: string, path: string, client: string}
   * @returns
   */
  private extractClients(files: any[]): string[] {
    const clients = files.map((file) => file.client);
    return [...new Set(clients)];
  }

  /**
   *  Merges the generated files and returns the path of the merged file
   * @param files - Array of generated files data {name: string, path: string, client: string}
   * @returns
   */
  private async mergeFiles(files: any[]): Promise<string> {
    //const sheet = workbook.addWorksheet('My Sheet');
    if (!files[0].client) {
      return;
    }
    const baseFilePath = `${__dirname}/${files[0].client}.xlsx`;
    const newWorkbook = new ExcelJS.Workbook();
    /*  const sheet = newWorkbook.addWorksheet('aux');
    sheet.state = 'hidden'; */
    await newWorkbook.xlsx.writeFile(baseFilePath);
    const workbookBase = await newWorkbook.xlsx.readFile(baseFilePath);

    for (const file of files) {
      const name = this.extractInitials(file.name);
      let source = new ExcelJS.Workbook();
      source = await source.xlsx.readFile(`${__dirname}/${file.name}`);
      source.eachSheet((sheet, index) => {
        if (sheet.state == 'hidden') {
          return;
        }
        const newSheet = workbookBase.addWorksheet(name + '-' + sheet.name);
        newSheet.model = Object.assign(sheet.model, {
          mergeCells: sheet.model.merges,
        });
        newSheet.name = name + '-' + sheet.name;
      });
    }
    await workbookBase.xlsx.writeFile(baseFilePath);
    return baseFilePath;
  }

  private extractInitials(name: string): string {
    const splitName = name.split(' ');
    const initials = splitName.map((name) => name[0]);
    return initials.join('');
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
