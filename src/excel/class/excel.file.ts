import * as excelJS from 'exceljs';
import * as fs from 'fs';

import { Helper } from '@webilix/helper-library';

import { ExcelColumnService } from '../providers/column.service';
import { ExcelPathService } from '../providers/path.service';
import { IExcel, IExcelConfig, IExcelSheetRow } from '../excel.interface';

import { ExcelSheet } from './excel.sheet';

interface IWriteColumn {
    readonly id: string;
    readonly title: string;
    readonly format: string;
    readonly view: 'FA' | 'EN';
    readonly rows: (string | null)[];
}

interface IWriteSheet {
    readonly title: string;
    readonly showIndex: boolean;
    readonly columns: IWriteColumn[];
}

export class ExcelFile {
    private _name: string;
    get name(): string {
        return this._name;
    }
    set name(name: string) {
        this._name = name;
    }

    private _hideEmptyRows: boolean;
    get hideEmptyRows(): boolean {
        return this._hideEmptyRows;
    }
    set hideEmptyRows(hideEmptyRows: boolean) {
        this._hideEmptyRows = hideEmptyRows;
    }

    private _hideEmptyColumns: boolean;
    get hideEmptyColumns(): boolean {
        return this._hideEmptyColumns;
    }
    set hideEmptyColumns(hideEmptyColumns: boolean) {
        this._hideEmptyColumns = hideEmptyColumns;
    }

    private _hideEmptySheets: boolean;
    get hideEmptySheets(): boolean {
        return this._hideEmptySheets;
    }
    set hideEmptySheets(hideEmptySheets: boolean) {
        this._hideEmptySheets = hideEmptySheets;
    }

    private _sheets: ExcelSheet[];
    get sheets(): ExcelSheet[] {
        return this._sheets;
    }

    private _config: IExcelConfig;
    private _columnService: ExcelColumnService;
    private _pathService: ExcelPathService;

    constructor(
        name: string,
        hideEmptyRows: boolean,
        hideEmptyColumns: boolean,
        hideEmptySheets: boolean,

        config: IExcelConfig,
        columnService: ExcelColumnService,
        pathService: ExcelPathService,
    ) {
        this._name = name;
        this._hideEmptyRows = hideEmptyRows;
        this._hideEmptyColumns = hideEmptyColumns;
        this._hideEmptySheets = hideEmptySheets;

        this._config = config;
        this._columnService = columnService;
        this._pathService = pathService;
        this._sheets = [];
    }

    public createSheet(title: string, options?: Partial<{ readonly showIndex: boolean }>): ExcelSheet {
        const sheet: ExcelSheet = new ExcelSheet(title, options?.showIndex !== false);
        this._sheets.push(sheet);

        return sheet;
    }

    public duplicateSheet(
        sheet: ExcelSheet,
        title: string,
        options?: Partial<{ readonly duplicateRows: boolean }>,
    ): ExcelSheet {
        const duplicate: ExcelSheet = new ExcelSheet(
            title,
            sheet.showIndex,
            sheet.columns.map((column) => ({ ...column })),
            options?.duplicateRows ? sheet.rows.map((row) => ({ ...row })) : [],
        );
        this._sheets.push(duplicate);

        return duplicate;
    }

    //#region WRITE FILE

    private getWriteSheets(): IWriteSheet[] {
        const writeSheets: IWriteSheet[] = [];
        this.sheets.forEach((sheet) => {
            const rows: IExcelSheetRow[] = !this.hideEmptyRows
                ? sheet.rows
                : sheet.rows.filter((row) => {
                      return sheet.columns.some(
                          (column) =>
                              !Helper.IS.empty(row[column.id]) && this._columnService.getValue(column, row[column.id]),
                      );
                  });

            const writeSheet: IWriteSheet = { title: sheet.title, showIndex: sheet.showIndex, columns: [] };

            sheet.columns.forEach((column) => {
                const writeColumn: IWriteColumn = {
                    id: column.id,
                    title: column.title,
                    view: this._columnService.getView(column),
                    format: this._columnService.getFormat(column),
                    rows: rows.map((row) =>
                        Helper.IS.empty(row[column.id]) ? null : this._columnService.getValue(column, row[column.id]),
                    ),
                };

                const hasValue: boolean = writeColumn.rows.some((value) => value !== null);
                if (hasValue || !this._hideEmptyColumns) writeSheet.columns.push(writeColumn);
            });

            if (writeSheet.columns.length !== 0 || !this._hideEmptySheets) writeSheets.push(writeSheet);
        });

        return writeSheets;
    }

    public writeFile(): Promise<IExcel> {
        return new Promise<IExcel>(async (resolve, reject) => {
            const writeSheets = this.getWriteSheets();
            if (writeSheets.length === 0) {
                reject('اطلاعاتی برای ایجاد فایل اکسل مشخص نشده است.');
                return;
            }

            const excelWorkbook = new excelJS.Workbook();
            writeSheets.forEach((writeSheet) => {
                const excelSheet = excelWorkbook.addWorksheet(writeSheet.title.replace(/[\*\?:\\\/\[\]]/gi, '-'), {
                    views: [{ rightToLeft: true, state: 'frozen', xSplit: 0 + (writeSheet.showIndex ? 1 : 0), ySplit: 1 }],
                    pageSetup: { orientation: 'portrait' },
                });

                // NO COLUMN (EMPTY SHEET)
                if (writeSheet.columns.length === 0) return;

                //#region WIDTH
                // INDEX
                if (writeSheet.showIndex) excelSheet.getColumn(1).width = 5;
                // COLUMNS
                writeSheet.columns.forEach((column, index: number) => {
                    const rows: number[] = column.rows.map((r) => (r === null ? 0 : r.length + 1));
                    const width: number = Math.max(column.title.length, ...rows);

                    excelSheet.getColumn(index + 1 + (writeSheet.showIndex ? 1 : 0)).width =
                        width < 5 ? 5 : width > 50 ? 50 : width;
                });
                //#endregion

                //#region HEADER
                // INDEX
                if (writeSheet.showIndex) {
                    const cell: excelJS.Cell = excelSheet.getCell(1, 1);
                    cell.value = 'ردیف';
                    cell.style = {
                        alignment: { horizontal: 'right', wrapText: false, vertical: 'middle', readingOrder: 'rtl' },
                        font: { name: this._config.fontFA, size: 10, bold: true },
                    };
                }
                // COLUMNS
                writeSheet.columns.forEach((column, index: number) => {
                    const cell: excelJS.Cell = excelSheet.getCell(1, index + 1 + (writeSheet.showIndex ? 1 : 0));
                    cell.value = column.title;
                    cell.style = {
                        alignment: { horizontal: 'right', wrapText: false, vertical: 'middle', readingOrder: 'rtl' },
                        font: { name: this._config.fontFA, size: 10, bold: true },
                    };
                });
                //#endregion

                //#region ROWS
                writeSheet.columns[0].rows.forEach((_, row: number) => {
                    // INDEX
                    if (writeSheet.showIndex) {
                        const cell: excelJS.Cell = excelSheet.getCell(row + 2, 1);
                        cell.value = Helper.NUMBER.format(row + 1);
                        cell.style = {
                            alignment: { horizontal: 'right', wrapText: true, vertical: 'top', readingOrder: 'rtl' },
                            font: { name: this._config.fontFA, size: 10 },
                            numFmt: '@',
                        };
                    }
                    // COLUMNS
                    writeSheet.columns.forEach((column, index: number) => {
                        const cell: excelJS.Cell = excelSheet.getCell(row + 2, index + 1 + (writeSheet.showIndex ? 1 : 0));
                        cell.value = column.rows[row];
                        cell.style = {
                            alignment: {
                                horizontal: column.view === 'EN' ? 'left' : 'right',
                                wrapText: true,
                                vertical: 'top',
                                readingOrder: column.view === 'EN' ? 'ltr' : 'rtl',
                            },
                            font: {
                                name: column.view === 'EN' ? this._config.fontEN : this._config.fontFA,
                                size: 10,
                            },
                            numFmt: column.format,
                        };
                    });
                });
                //#endregion
            });

            let path = '';
            try {
                const extension: string = 'xlsx';
                const file: string = Helper.STRING.getFileName(this.name, extension);
                path = `${this._pathService.getPath()}${file}`;
            } catch (e) {
                reject('امکان ایجاد دایرکتوری اصلی خروجی اطلاعات وجود ندارد.');
                return;
            }

            try {
                await excelWorkbook.xlsx.writeFile(path);
                resolve({
                    path,
                    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    size: fs.statSync(path).size,
                });
            } catch (e) {
                reject('امکان ایجاد فایل اکسل وجود ندارد.');
                return;
            }
        });
    }
    //#endregion
}
