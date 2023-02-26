import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { JalaliDateTime } from '@webilix/jalali-date-time';

import { IExportConfig } from '../export.interface';

@Injectable()
export class ExportPathService {
    constructor(@Inject('EXPORT_CONFIG') private readonly config: IExportConfig) {}

    getPath(): string {
        let path = this.config.path;
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

    emptyPath(date: Date): Promise<string[]> {
        let path = this.config.path;
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

                    if (fs.readdirSync(dir).length === 0) {
                        deleted.push(dir);
                        fs.rmdirSync(dir);
                    }
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
}
