import { Injectable } from '@nestjs/common';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { Helper } from '@webilix/helper-library';

import { FormatsEnum } from '../../formats';

import { IExcelSheetColumn } from '../excel.interface';

@Injectable()
export class ExcelColumnService {
    getView(column: IExcelSheetColumn): 'FA' | 'EN' {
        switch (column.type) {
            case 'BOOLEAN':
            case 'DATE':
                return 'FA';

            case 'NUMBER':
            case 'STRING':
                return column.view === 'ENGLISH' ? 'EN' : 'FA';
        }
    }

    getFormat(column: IExcelSheetColumn): string {
        switch (column.type) {
            case 'BOOLEAN':
            case 'DATE':
                return '@';

            case 'NUMBER':
                return '#,##0';

            case 'STRING':
                return '@';
        }
    }

    getValue(column: IExcelSheetColumn, value: any): string | null {
        const jalali = JalaliDateTime();

        switch (column.type) {
            case 'BOOLEAN':
                return !Helper.IS.boolean(value)
                    ? null
                    : value === true
                      ? (column.booleanTrueTitle ?? 'بلی')
                      : (column.booleanFalseTitle ?? 'خیر');

            case 'DATE':
                if (!Helper.IS.date(value)) return null;
                switch (column.dateFormat) {
                    case 'DATE':
                        return jalali.toFullText(value, { format: 'W، d N Y' });
                    case 'TIME':
                        return jalali.toFullText(value, { format: 'H:I:S' });
                    case 'FULL':
                        return jalali.toFullText(value, { format: 'W، d N Y H:I:S' });
                    default:
                        return jalali.toFullText(value, { format: column.dateFormat ?? 'W، d N Y' });
                }

            case 'NUMBER':
                return !Helper.IS.number(value) ? null : Helper.NUMBER.format(value, this.getView(column));

            case 'STRING':
                if (!Helper.IS.string(value)) return null;
                if (column.stringFormat && !FormatsEnum[column.stringFormat].validate(value)) return null;
                return column.stringFormat && FormatsEnum[column.stringFormat].export
                    ? (FormatsEnum[column.stringFormat].export?.(value) ?? null)
                    : value;
        }
    }
}
