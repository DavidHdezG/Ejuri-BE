import { Inject, Injectable } from '@nestjs/common';
import { AnnexCellService } from 'src/api/pld/annex-cell/annex-cell.service';
import { AnnexService } from 'src/api/pld/annex/annex.service';
import * as ExcelJS from 'exceljs';
@Injectable()
export class AnnexGenerationService {
  constructor(
    @Inject(AnnexService) private readonly annexService: AnnexService,
    @Inject(AnnexCellService) private readonly testService: AnnexCellService,
  ) {}

  async generateAnnex() {
    let personName = []
    for (let index = 1; index < 20; index++) {
      const annex = await this.annexService.findOne(index);
      let list = JSON.stringify(annex.annexCell, null, 2);
      let dlist = JSON.parse(list);
      const file = await this.loadExcelFile(__dirname + '/Libro1.xlsx');
      let workbook = new ExcelJS.Workbook();
      if(personName.length!=0){       
        workbook = await workbook.xlsx.readFile(`${__dirname}/${personName[0]}.xlsx`);
      }else{
        workbook = await workbook.xlsx.readFile(__dirname + '/new.xlsx');
      }
      let worksheet:ExcelJS.Worksheet= workbook.getWorksheet(annex.name);
      console.log(annex.name);
      // Un ciclo por cada persona
      for (const row of file) {
        let name =
          row['Nombre(s)'] +
          ' ' +
          row['Apellido paterno'] +
          ' ' +
          row['Apellido Materno'];
        personName.push(name)
        for (const item of dlist) {
          if (row[item.cell.name]) {
            worksheet.getCell(item.cell.cell).value = row[item.cell.name];
          } else {
            console.log("No existen las columnas");
            console.log(item.cell.name)
          }
        }
        const date = new Date(row['Fecha de Nacimiento (dd/mm/aaaa)']);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Nota: en JavaScript, los meses van de 0 a 11
        const año = date.getFullYear();
        console.log(`${dia}/${mes}/${año}`);
        await workbook.xlsx.writeFile(__dirname+'/'+name + '.xlsx');
      }
      
    }
/*     const annex = await this.annexService.findOne(4);
    let list = JSON.stringify(annex.annexCell, null, 2);
    let dlist = JSON.parse(list);
    const file = await this.loadExcelFile(__dirname + '/Libro1.xlsx');
    var workbook = new ExcelJS.Workbook();
    workbook = await workbook.xlsx.readFile(__dirname + '/new.xlsx');
    var worksheet = workbook.getWorksheet(annex.name);
    console.log(annex.name);
    // Un ciclo por cada persona
    for (const row of file) {
      let name =
        row['Nombre(s)'] +
        ' ' +
        row['Apellido paterno'] +
        ' ' +
        row['Apellido Materno'];
      for (const item of dlist) {
        if (row[item.cell.name]) {
          worksheet.getCell(item.cell.cell).value = row[item.cell.name];
        } else {
          console.log("No existen las columnas");
          console.log(item.cell.name)
        }
      }
      const date = new Date(row['Fecha de Nacimiento (dd/mm/aaaa)']);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0'); // Nota: en JavaScript, los meses van de 0 a 11
      const año = date.getFullYear();
      console.log(`${dia}/${mes}/${año}`);
      await workbook.xlsx.writeFile(name + '.xlsx');
    } */
    /* if(item.cell.name == row['Nombre(s)']){
          console.log(row['Nombre(s)']);
        } */

    /*  return  annex */
  }

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

        // Opcional: Guardar los datos en un archivo JSON
        /* fs.writeFileSync('datos.json', JSON.stringify(data, null, 2)); */
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}
