import * as excelJS from 'exceljs';

import { Helper } from '@webilix/helper-library';

import { Formats, FormatsEnum } from '../../formats';

import { IExportColumn, IExportMethod } from '../export.interface';

export interface IExportStringColumn extends IExportColumn {
    type: 'STRING';
    english?: boolean;
    format?: Formats;
}

const getValue = (value: string, column: IExportStringColumn): string => {
    if (!Helper.IS.string(value)) return '';
    if (column.format && !FormatsEnum[column.format].validate(value)) return '';

    return column.format && FormatsEnum[column.format].export ? FormatsEnum[column.format].export?.(value) || '' : value;
};

export const ExportStringMethod: IExportMethod<IExportStringColumn, string> = {
    xlsx: {
        format: '@',
        english: (column: IExportStringColumn) => !!column.english || !!(column.format && column.format !== 'PLATE'),
        value: (value: string, column: IExportStringColumn): excelJS.CellValue => getValue(value, column),
    },

    docx: {
        english: (column: IExportStringColumn) => !!column.english || !!(column.format && column.format !== 'PLATE'),
        value: (value: string, column: IExportStringColumn): string => getValue(value, column),
    },

    validate: (value: string, column: IExportStringColumn): boolean =>
        Helper.IS.string(value) && (!column.format || FormatsEnum[column.format].validate(value)),
    width: (value: string, column: IExportStringColumn): number =>
        Math.max(
            ...getValue(value, column)
                .split('\n')
                .map((v) => v.length),
        ),
};
