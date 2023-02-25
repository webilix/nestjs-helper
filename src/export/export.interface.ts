import * as excelJS from 'exceljs';

import { ExportColumn } from './export.type';

export interface IExport {
    path: string;
    mime: string;
    size: number;
}

export interface IExportConfig {
    path: string;
    fontFA: string;
    fontEN: string;
    backgroundColor: string;
    foregroundColor: string;
    textColor: string;

    gotenberg: string;
}

export interface IExportHeader {
    title: string;
    value: string;
}

export interface IExportColumn {
    id: string;
    title: string;
    hideOn?: () => boolean;
}

export interface IExportTable {
    title: string;
    description?: string;
    logo?: string;

    headers?: IExportHeader[];
    columns: ExportColumn[];
    rows: { [key: string]: any }[];
}

export interface IExportMethod<C /* COLUMN */, V /* VALUE */> {
    xlsx: {
        format: string;
        english: (column: C) => boolean;
        value: (value: V, column: C) => excelJS.CellValue;
    };

    docx: {
        english: (column: C) => boolean;
        value: (value: V, column: C) => string;
    };

    validate: (value: V, column: C) => boolean;
    width: (value: V, column: C) => number;
}
