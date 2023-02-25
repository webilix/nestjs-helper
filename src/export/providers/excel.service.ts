import { Injectable } from '@nestjs/common';
import * as excelJS from 'exceljs';

import { IExportConfig, IExportHeader, IExportTable } from '../export.interface';
import { ExportColumn, ExportColumnEnum } from '../export.type';

@Injectable()
export class ExportExcelService {
    export(path: string, table: IExportTable, config: IExportConfig): Promise<void> {
        const fill: excelJS.Fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: config.backgroundColor },
        };

        return new Promise<void>(async (resolve, reject) => {
            try {
                const workbook = new excelJS.Workbook();
                const sheet: excelJS.Worksheet = workbook.addWorksheet(table.title.replace(/[\*\?:\\\/\[\]]/gi, '-'), {
                    views: [
                        {
                            rightToLeft: true,
                            state: 'frozen',
                            xSplit: 0,
                            ySplit: 6 + (table.description ? 1 : 0) + (table.headers || []).length,
                        },
                    ],
                    pageSetup: { orientation: 'portrait' },
                });

                // FILL
                [...Array(3 + (table.description ? 1 : 0) + (table.headers || []).length).keys()].forEach((row: number) => {
                    [2, 3, 4, 5].forEach((column) => {
                        const cell: excelJS.Cell = sheet.getCell(row + 2, column);
                        cell.style = {
                            alignment: { horizontal: 'right', wrapText: false, vertical: 'middle', readingOrder: 'rtl' },
                            font: { color: { argb: config.foregroundColor }, name: config.fontFA, size: 10 },
                            fill,
                        };
                    });
                });

                let rowIndex = 3;

                // TITLE
                const title: excelJS.Cell = sheet.getCell(rowIndex, 4);
                title.merge(sheet.getCell(rowIndex, 3));
                title.value = table.title;
                if (title.style.font) {
                    title.style.font.size = 12;
                    title.style.font.bold = true;
                }
                rowIndex++;

                // DESCRIPTION
                if (table.description) {
                    const description: excelJS.Cell = sheet.getCell(rowIndex, 4);
                    description.merge(sheet.getCell(rowIndex, 3));
                    description.value = table.description;
                    if (description.style.font) {
                        description.style.font.size = 9;
                        description.style.font.bold = true;
                    }
                    rowIndex++;
                }

                // HEADERS
                (table.headers || []).map((header: IExportHeader) => {
                    const title: excelJS.Cell = sheet.getCell(rowIndex, 3);
                    title.value = `${header.title}:`;

                    const value: excelJS.Cell = sheet.getCell(rowIndex, 4);
                    value.value = header.value;

                    rowIndex++;
                });
                rowIndex++;

                // WIDTH
                table.columns.forEach((column: ExportColumn, c: number) => {
                    const rows: number[] = table.rows.map((r) => ExportColumnEnum[column.type].width(r[column.id], column));
                    const width: number = Math.max(column.title.length, ...rows);

                    sheet.getColumn(c + 1).width = width < 5 ? 5 : width > 50 ? 50 : width;
                });

                // COLUMNS
                rowIndex++;
                table.columns.forEach((column: ExportColumn, c: number) => {
                    const cell: excelJS.Cell = sheet.getCell(rowIndex, c + 1);
                    cell.value = column.title;
                    cell.style = {
                        alignment: {
                            horizontal: 'right',
                            wrapText: false,
                            vertical: 'middle',
                            readingOrder: 'rtl',
                        },
                        font: {
                            color: { argb: config.foregroundColor },
                            name: config.fontFA,
                            size: 10,
                            bold: true,
                        },
                        fill,
                    };
                });
                sheet.getRow(rowIndex).height = 25;

                // ROWS
                table.rows.forEach((row) => {
                    rowIndex++;
                    table.columns.forEach((column: ExportColumn, c: number) => {
                        const english: boolean = ExportColumnEnum[column.type].xlsx.english(column);

                        const cell: excelJS.Cell = sheet.getCell(rowIndex, c + 1);
                        cell.value = ExportColumnEnum[column.type].xlsx.value(row[column.id], column);
                        cell.style = {
                            alignment: {
                                horizontal: english ? 'left' : 'right',
                                wrapText: true,
                                vertical: 'top',
                                readingOrder: 'rtl',
                            },
                            font: {
                                color: { argb: config.textColor },
                                name: english ? config.fontEN : config.fontFA,
                                size: 10,
                            },
                            numFmt: ExportColumnEnum[column.type].xlsx.format,
                        };
                    });
                });

                await workbook.xlsx.writeFile(path);
                resolve();
            } catch (e) {
                reject();
            }
        });
    }
}
