import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { IExportTable } from '../export.interface';

@Injectable()
export class ExportCsvService {
    constructor() {}

    private getJSON = (line: any[]) =>
        JSON.stringify(line.reverse())
            .replace(/(^\[)|(\]$)/gm, '')
            .replace(/""/g, '')
            .replace(/\\"/g, '""')
            .replace(/\\n/g, '\r\n');

    export(path: string, table: IExportTable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const stream = fs.createWriteStream(path, { flags: 'w' });

                const line: string[] = table.columns.map((column) => column.title);
                stream.write(this.getJSON(line), (error) => writeLine(error, 0));

                const writeLine = (error: any, index: number): void => {
                    if (!!error) {
                        stream.close();
                        reject();
                        return;
                    }

                    if (!table.rows[index]) {
                        stream.close();
                        resolve();
                        return;
                    }

                    const line: any[] = [];
                    table.columns.forEach((column) => {
                        const value = table.rows[index][column.id];
                        line.push(value === undefined ? '' : value);
                    });
                    stream.write('\n' + this.getJSON(line), (error) => writeLine(error, index + 1));
                };
            } catch (e) {
                reject();
            }
        });
    }
}
