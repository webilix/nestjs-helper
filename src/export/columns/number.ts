import * as excelJS from 'exceljs';

import { Helper } from '@webilix/helper-library';

import { IExportColumn, IExportMethod } from '../export.interface';

export interface IExportNumberColumn extends IExportColumn {
    type: 'NUMBER';
    english?: boolean;
}

const getValue = (value: number, column: IExportNumberColumn): string =>
    Helper.IS.number(value) ? Helper.NUMBER.format(value, !!column.english ? 'EN' : 'FA') : '';

export const ExportNumberMethod: IExportMethod<IExportNumberColumn, number> = {
    xlsx: {
        format: '#,##0',
        english: () => true,
        value: (value: number): excelJS.CellValue => (Helper.IS.number(value) ? value : null),
    },

    docx: {
        english: (column: IExportNumberColumn) => !!column.english,
        value: (value: number, column: IExportNumberColumn): string => getValue(value, column),
    },

    validate: (value: number): boolean => Helper.IS.number(value),
    width: (value: number, column: IExportNumberColumn): number => getValue(value, column).length,
};
