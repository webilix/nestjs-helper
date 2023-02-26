import { Inject, Injectable, Optional } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';

import { Helper } from '@webilix/helper-library';

import { ExportExcelService, ExportPathService, ExportWordService } from './providers';
import { IExport, IExportConfig, IExportTable } from './export.interface';
import { ExportColumn, ExportColumnEnum, ExportType, ExportTypeEnum } from './export.type';

@Injectable()
export class ExportService {
    constructor(
        @Inject('EXPORT_CONFIG') private readonly config: IExportConfig,
        private readonly excelService: ExportExcelService,
        private readonly pathService: ExportPathService,
        private readonly wordService: ExportWordService,
    ) {}

    private updateTable(table: IExportTable): void {
        table.description = table.description || undefined;
        table.headers = (table.headers || []).filter((h) => !Helper.IS.empty(h.title) && !Helper.IS.empty(h.value));

        table.columns = table.columns.filter((c: ExportColumn) => {
            if (c.hideOn && c.hideOn()) return false;

            const validates: boolean[] = table.rows.map((r) => ExportColumnEnum[c.type].validate(r[c.id], c));
            return validates.includes(true);
        });

        table.rows = table.rows.filter((r) => {
            const validates: boolean[] = table.columns.map((c) => ExportColumnEnum[c.type].validate(r[c.id], c));
            return validates.includes(true);
        });
    }

    public getPath = this.pathService.getPath;
    public emptyPath = this.pathService.emptyPath;

    export(type: ExportType, table: IExportTable, name?: string): Promise<IExport> {
        return new Promise((resolve, reject) => {
            this.updateTable(table);
            if (table.columns.length === 0 || table.rows.length === 0) {
                reject('اطلاعاتی برای ایجاد خروجی، مشخص نشده است.');
                return;
            }

            let path = '';
            try {
                const file: string = Helper.STRING.getFileName(name || table.title, ExportTypeEnum[type].ext);
                path = `${this.getPath()}${file}`;
            } catch (e) {
                reject('امکان ایجاد دایرکتوری اصلی خروجی اطلاعات وجود ندارد.');
                return;
            }

            try {
                let promise: Promise<void>;
                switch (type) {
                    case 'EXCEL':
                        promise = this.excelService.export(path, table);
                        break;
                    case 'PDF':
                        promise = this.wordService.export(`${path}.docx`, table);
                        break;
                    case 'WORD':
                        promise = this.wordService.export(path, table);
                        break;
                }

                promise.then(
                    () => {
                        switch (type) {
                            case 'PDF':
                                this.convertToPDF(`${path}.docx`, path).then(
                                    (response) => resolve(response),
                                    (error: string) => reject(error),
                                );
                                break;

                            default:
                                resolve({ path, mime: ExportTypeEnum[type].mime, size: fs.statSync(path).size });
                                break;
                        }
                    },
                    (e) => reject(e || 'امکان ایجاد فایل خروجی وجود ندارد.'),
                );
            } catch (e) {
                reject('امکان ایجاد فایل خروجی وجود ندارد.');
            }
        });
    }

    convertToPDF(from: string, to: string): Promise<IExport> {
        return new Promise<IExport>((resolve, reject) => {
            let gotenberg = this.config.gotenberg || '';
            if (Helper.IS.empty(gotenberg)) {
                reject('تنظیمات خروجی پی‌دی‌اف، مشخص نشده است.');
                return;
            }

            if (gotenberg.substring(gotenberg.length - 1) !== '/') gotenberg += '/';
            gotenberg += 'forms/libreoffice/convert';

            try {
                const path: string = from.split('/').slice(0, -1).join('/') + '/';
                const ext: string = from.split('.').slice(-1)[0];
                let time: number = new Date().getTime();
                while (fs.existsSync(`${path}${time}.${ext}`)) time++;

                const temp = `${path}${time}.${ext}`;
                fs.copyFileSync(from, temp);

                const command = `curl --request POST '${gotenberg}' --form 'files=@"${temp}"' -o ${to}`;
                exec(command, (error) => {
                    fs.unlinkSync(temp);
                    !error
                        ? resolve({ path: to, mime: ExportTypeEnum['PDF'].mime, size: fs.statSync(to).size })
                        : reject('امکان ایجاد فایل پی‌دی‌اف وجود ندارد.');
                });
            } catch (e) {
                reject('امکان ایجاد فایل پی‌دی‌اف وجود ندارد.');
            }
        });
    }
}
