import * as excelJS from 'exceljs';

import { Helper } from '@webilix/helper-library';

import { IExportColumn, IExportMethod } from '../export.interface';

export interface IExportBooleanColumn extends IExportColumn {
    type: 'BOOLEAN';
    true?: string;
    false?: string;
}

const getValue = (value: boolean, column: IExportBooleanColumn): string =>
    Helper.IS.boolean(value) ? (value ? column.true || 'بلی' : column.false || 'خیر') : '';

export const ExportBooleanMethod: IExportMethod<IExportBooleanColumn, boolean> = {
    xlsx: {
        format: '@',
        english: () => false,
        value: (value: boolean, column: IExportBooleanColumn): excelJS.CellValue => getValue(value, column),
    },

    docx: {
        english: () => false,
        value: (value: boolean, column: IExportBooleanColumn): string => getValue(value, column),
    },

    validate: (value: boolean): boolean => Helper.IS.boolean(value),
    width: (value: boolean, column: IExportBooleanColumn): number => getValue(value, column).length,
};
