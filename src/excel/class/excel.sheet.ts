import { Formats } from '../../formats';

import { IExcelSheetColumn, IExcelSheetRow } from '../excel.interface';

export class ExcelSheet {
    private _title: string;
    get title(): string {
        return this._title;
    }
    set title(title: string) {
        this.title = title;
    }

    private _showIndex: boolean;
    get showIndex(): boolean {
        return this._showIndex;
    }
    set showIndex(showIndex: boolean) {
        this._showIndex = showIndex;
    }

    private _columns: IExcelSheetColumn[];
    get columns(): IExcelSheetColumn[] {
        return this._columns;
    }

    private _rows: IExcelSheetRow[];
    get rows(): IExcelSheetRow[] {
        return this._rows;
    }

    constructor(title: string, showIndex: boolean, columns: IExcelSheetColumn[] = [], rows: IExcelSheetRow[] = []) {
        this._title = title;
        this._showIndex = showIndex;
        this._columns = columns;
        this._rows = rows;
    }

    public addColumn = {
        boolean: (
            id: string,
            title: string,
            options?: Partial<{ readonly hideOn: () => boolean; readonly trueTitle: string; readonly falseTitle: string }>,
        ): ExcelSheet => {
            this._columns.push({
                type: 'BOOLEAN',
                id,
                title,
                hideOn: options?.hideOn,
                booleanTrueTitle: options?.trueTitle,
                booleanFalseTitle: options?.falseTitle,
            });

            return this;
        },

        date: (
            id: string,
            title: string,
            options?: Partial<{ readonly hideOn: () => boolean; readonly format?: 'DATE' | 'TIME' | 'FULL' | string }>,
        ): ExcelSheet => {
            this._columns.push({
                type: 'DATE',
                id,
                title,
                hideOn: options?.hideOn,
                dateFormat: options?.format,
            });

            return this;
        },

        number: (
            id: string,
            title: string,
            options?: Partial<{ readonly hideOn: () => boolean; readonly view: 'ENGLISH' }>,
        ): ExcelSheet => {
            this._columns.push({
                type: 'NUMBER',
                id,
                title,
                hideOn: options?.hideOn,
                view: options?.view,
            });

            return this;
        },

        string: (
            id: string,
            title: string,
            options?: Partial<{ readonly hideOn: () => boolean; readonly view: 'ENGLISH'; readonly format: Formats }>,
        ): ExcelSheet => {
            this._columns.push({
                type: 'STRING',
                id,
                title,
                hideOn: options?.hideOn,
                view: options?.view,
                stringFormat: options?.format,
            });

            return this;
        },
    };

    public addRow(row: IExcelSheetRow | IExcelSheetRow[]): ExcelSheet {
        (Array.isArray(row) ? row : [row]).forEach((row) => this.rows.push(row));

        return this;
    }
}
