import * as excelJS from 'exceljs';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

import { IExportColumn, IExportMethod } from '../export.interface';

export interface IExportDateColumn extends IExportColumn {
    type: 'DATE';
    format?: 'DATE' | 'TIME' | 'FULL' | string;
}

const getValue = (value: Date, column: IExportDateColumn): string => {
    if (!Helper.IS.date(value)) return '';

    let format = '';
    switch (column.format) {
        case 'DATE':
            format = 'W، d N Y';
            break;
        case 'TIME':
            format = 'H:I:S';
            break;
        case 'FULL':
            format = 'W، d N Y H:I:S';
            break;
        default:
            format = column.format || 'W، d N Y';
            break;
    }
    return JalaliDateTime().toFullText(value, { format });
};

export const ExportDateMethod: IExportMethod<IExportDateColumn, Date> = {
    xlsx: {
        format: '@',
        english: () => false,
        value: (value: Date, column: IExportDateColumn): excelJS.CellValue => getValue(value, column),
    },

    docx: {
        english: () => false,
        value: (value: Date, column: IExportDateColumn): string => getValue(value, column),
    },

    validate: (value: Date): boolean => Helper.IS.date(value),
    width: (value: Date, column: IExportDateColumn): number => getValue(value, column).length,
};
