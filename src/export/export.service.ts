import { Inject, Injectable, Optional } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

import { ExportExcelService, ExportWordService } from './providers';
import { IExport, IExportConfig, IExportTable } from './export.interface';
import { ExportColumn, ExportColumnEnum, ExportType, ExportTypeEnum } from './export.type';

@Injectable()
export class ExportService {
    constructor(
        private readonly excelService: ExportExcelService,
        private readonly wordService: ExportWordService,
        @Optional() @Inject('EXPORT_CONFIG') private readonly config?: Partial<IExportConfig>,
    ) {}

    private getConfig(config: Partial<IExportConfig>): IExportConfig {
        const getColor = (color: string | undefined, base: string): string =>
            (Helper.COLOR.toHEX(Helper.IS.STRING.color(color) ? color || base : base) || base).substring(1);

        return {
            path: config?.path || this.config?.path || '.export',
            fontFA: config?.fontFA || this.config?.fontFA || 'IRANYekan',
            fontEN: config?.fontEN || this.config?.fontEN || 'Arial',
            backgroundColor: getColor(config?.backgroundColor || this.config?.backgroundColor, '#1D5B74'),
            foregroundColor: getColor(config?.foregroundColor || this.config?.foregroundColor, '#FFFFFF'),
            textColor: getColor(config?.textColor || this.config?.textColor, '#000000'),

            logo: config?.logo || this.config?.logo || undefined,
            gotenberg: config?.gotenberg || this.config?.gotenberg || undefined,
        };
    }

    private getPath(path: string): string {
        if (path.substring(path.length - 1) !== '/') path += '/';

        let dir = '';
        path.split('/')
            .filter((p: string) => p !== '' && p !== '.')
            .forEach((p: string) => {
                if (!fs.existsSync(`${dir}${p}`)) fs.mkdirSync(`${dir}${p}`);
                dir += `${p}/`;
            });

        let date = '';
        do {
            const mili: string = new Date().getMilliseconds().toString().padStart(3, '0');
            date = `${JalaliDateTime().toString(new Date(), { format: 'YMD-HIS-' })}${mili}`;
        } while (fs.existsSync(`${path}${date}`));
        fs.mkdirSync(`${path}${date}`);

        return `${path}${date}/`;
    }

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

    export(type: ExportType, table: IExportTable): Promise<IExport>;
    export(type: ExportType, table: IExportTable, name: string): Promise<IExport>;
    export(type: ExportType, table: IExportTable, config: Partial<IExportConfig>): Promise<IExport>;
    export(type: ExportType, table: IExportTable, name: string, config: Partial<IExportConfig>): Promise<IExport>;
    export(type: ExportType, table: IExportTable, arg1?: any, arg2?: any): Promise<IExport> {
        return new Promise((resolve, reject) => {
            const config: IExportConfig = this.getConfig(arg2 || typeof arg1 !== 'string' ? arg1 || {} : {});
            this.updateTable(table);
            if (table.columns.length === 0 || table.rows.length === 0) {
                reject('اطلاعاتی برای ایجاد خروجی، مشخص نشده است.');
                return;
            }

            let path = '';
            try {
                const name: string | null = typeof arg1 === 'string' ? arg1 || null : null;
                const file: string = Helper.STRING.getFileName(name || table.title, ExportTypeEnum[type].ext);
                path = `${this.getPath(config.path)}${file}`;
            } catch (e) {
                reject('امکان ایجاد دایرکتوری اصلی خروجی اطلاعات وجود ندارد.');
                return;
            }

            try {
                let promise: Promise<void>;
                switch (type) {
                    case 'EXCEL':
                        promise = this.excelService.export(path, table, config);
                        break;
                    case 'PDF':
                        promise = this.wordService.export(`${path}.docx`, table, config);
                        break;
                    case 'WORD':
                        promise = this.wordService.export(path, table, config);
                        break;
                }

                promise.then(
                    () => {
                        switch (type) {
                            case 'PDF':
                                this.convertToPDF(`${path}.docx`, path, config.gotenberg).then(
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

    emptyPath(date: Date, path?: string): Promise<string[]> {
        path = path || this.getConfig({}).path;
        if (path.substring(path.length - 1) !== '/') path += '/';

        const getDirs = (path: string): string[] => {
            const dirs: string[] = [];
            fs.readdirSync(path).forEach((dir: string) => {
                if (!fs.statSync(`${path}${dir}`).isDirectory()) return;
                dirs.push(`${path}${dir}/`, ...getDirs(`${path}${dir}/`));
            });

            return dirs;
        };

        return new Promise<string[]>((resolve, reject) => {
            const deleted: string[] = [];
            if (!fs.existsSync(path || '')) {
                resolve([]);
                return;
            }

            try {
                const dirs: string[] = getDirs(path || '');
                dirs.forEach((dir: string) => {
                    const files: string[] = fs.readdirSync(dir);
                    files.forEach((file: string) => {
                        const stat = fs.statSync(`${dir}${file}`);
                        if (stat.ctime.getTime() >= date.getTime()) return;

                        deleted.push(`${dir}${file}`);
                        fs.unlinkSync(`${dir}${file}`);
                    });

                    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
                });

                const files: string[] = fs.readdirSync(path || '');
                files.forEach((file: string) => {
                    const stat = fs.statSync(`${path}${file}`);
                    if (stat.ctime.getTime() >= date.getTime()) return;

                    deleted.push(`${path}${file}`);
                    fs.unlinkSync(`${path}${file}`);
                });

                resolve(deleted);
            } catch (e) {
                reject();
            }
        });
    }

    convertToPDF(from: string, to: string, gotenberg?: string): Promise<IExport> {
        return new Promise<IExport>((resolve, reject) => {
            gotenberg = gotenberg || this.getConfig({}).gotenberg || '';
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
