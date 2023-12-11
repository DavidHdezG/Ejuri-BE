import { Inject, Injectable, Logger } from '@nestjs/common';
import { AnnexCellService } from 'src/api/pld/annex-cell/annex-cell.service';
import { AnnexService } from 'src/api/pld/annex/annex.service';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import { DriveService } from 'src/drive/drive.service';
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
  async generateAnnex(filePath: string, annexData: any) {
    const filesData = new GeneratedFileData();
    const file = await this.loadExcelFile(filePath);
    const annexList = await this.annexService.findAll();
    const annexListID = this.extractAnnexIDs(annexList);

    for (const row of file) {
      const workbook = await this.loadWorkbook();
      const name = this.extractName(row);

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
    return filesID;
  }

  private extractAnnexIDs(annexList: any[]): number[] {
    return annexList.map((annex) => annex.id);
  }

  private async loadWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(__dirname + '/new.xlsx');
  }

  private extractName(row: any): string {
    return row[
      'Nombre Completo (apellido paterno, materno y nombre(s) sin abreviaturas) o Razón Social'
    ];
  }

  private isAnnexDataEmpty(annexData: any[]): boolean {
    return annexData.length == 0;
  }

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

  private updateDateCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    worksheet.getCell(item.cell.cell).value =
      row['Lugar'] +", "+ row[item.cell.name].toLocaleDateString();
  }

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

  private updateDefaultCell(worksheet: ExcelJS.Worksheet, item: any, row: any) {
    worksheet.getCell(item.cell.cell).value = row[item.cell.name];
  }
  private parseAnnexCell(annexCell: any): any[] {
    const list = JSON.stringify(annexCell, null, 2);
    return JSON.parse(list);
  }
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
  private unlinkFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
