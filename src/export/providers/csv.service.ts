import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { IExportConfig, IExportTable } from '../export.interface';

@Injectable()
export class ExportCsvService {
    constructor(@Inject('EXPORT_CONFIG') private readonly config: IExportConfig) {}

    export(path: string, table: IExportTable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const content: any[][] = [table.columns.map((column) => column.title)];
                table.rows.forEach((row) => {
                    const data: any[] = [];
                    table.columns.forEach((column) => {
                        const value = row[column.id];
                        data.push(value === undefined ? '' : value);
                    });
                    content.push(data);
                });

                const lines: string[] = content.map((c) =>
                    JSON.stringify(c.reverse())
                        .replace(/(^\[)|(\]$)/gm, '')
                        .replace(/""/g, '')
                        .replace(/\\"/g, '""')
                        .replace(/\\n/g, '\r\n'),
                );

                fs.writeFileSync(path, lines.join('\n'));
                resolve();
            } catch (e) {
                reject();
            }
        });
    }
}
