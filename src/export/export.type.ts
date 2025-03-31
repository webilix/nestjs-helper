import {
    ExportBooleanMethod,
    ExportDateMethod,
    ExportNumberMethod,
    ExportStringMethod,
    IExportBooleanColumn,
    IExportDateColumn,
    IExportNumberColumn,
    IExportStringColumn,
} from './columns';
import { IExportMethod } from './export.interface';

export type ExportType = 'EXCEL' | 'WORD' | 'PDF' | 'CSV';

interface IExportType {
    title: string;
    mime: string;
    ext: string;
}

export const ExportTypeEnum: { [key in ExportType]: IExportType } = {
    EXCEL: { title: 'فرمت اکسل', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' },
    WORD: {
        title: 'فرمت ورد',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ext: 'docx',
    },
    PDF: { title: 'فرمت پی‌دی‌اف', mime: 'application/pdf', ext: 'pdf' },
    CSV: { title: 'فرمت سی‌اس‌وی‌', mime: 'text/csv', ext: 'csv' },
};

export const ExportTypeList: ExportType[] = Object.keys(ExportTypeEnum) as ExportType[];

export type ExportColumn = IExportBooleanColumn | IExportDateColumn | IExportNumberColumn | IExportStringColumn;

export const ExportColumnEnum: { [key in ExportColumn['type']]: IExportMethod<any, any> } = {
    BOOLEAN: ExportBooleanMethod,
    DATE: ExportDateMethod,
    NUMBER: ExportNumberMethod,
    STRING: ExportStringMethod,
};
