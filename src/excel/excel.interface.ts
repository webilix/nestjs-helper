import { Formats } from '../formats';

export interface IExcelFile {
    readonly path: string;
    readonly mime: string;
    readonly size: number;
}

export interface IExcelConfig {
    readonly path: string;
    readonly fontFA: string;
    readonly fontEN: string;
}

export interface IExcelSheetColumn {
    readonly type: 'STRING' | 'DATE' | 'NUMBER' | 'BOOLEAN';
    readonly id: string;
    readonly title: string;
    readonly view?: 'ENGLISH';
    readonly hideOn?: () => boolean;

    // STRING
    readonly stringFormat?: Formats;

    // DATE
    readonly dateFormat?: 'DATE' | 'TIME' | 'FULL' | string;

    // BOOLEAN
    readonly booleanTrueTitle?: string;
    readonly booleanFalseTitle?: string;
}

export type IExcelSheetRow = { [key: string]: any };
