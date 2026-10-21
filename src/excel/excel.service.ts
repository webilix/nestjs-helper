import { Inject, Injectable } from '@nestjs/common';

import { ExcelFile } from './class/excel.file';
import { ExcelColumnService } from './providers/column.service';
import { ExcelPathService } from './providers/path.service';
import { IExcelConfig } from './excel.interface';

@Injectable()
export class ExcelService {
    constructor(
        @Inject('EXCEL_CONFIG') private readonly config: IExcelConfig,
        private readonly columnService: ExcelColumnService,
        private readonly pathService: ExcelPathService,
    ) {}

    public getPath = this.pathService.getPath;
    public emptyPath = this.pathService.emptyPath;

    public createExcel(
        name: string,
        options?: Partial<{
            readonly hideEmptyRows: boolean;
            readonly hideEmptyColumns: boolean;
            readonly hideEmptySheets: boolean;
        }>,
    ): ExcelFile {
        const excel: ExcelFile = new ExcelFile(
            name,
            options?.hideEmptyRows === false ? false : true,
            options?.hideEmptyColumns === false ? false : true,
            options?.hideEmptySheets === false ? false : true,

            this.config,
            this.columnService,
            this.pathService,
        );

        return excel;
    }
}
