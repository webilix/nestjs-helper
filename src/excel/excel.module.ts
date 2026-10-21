import { DynamicModule, Module } from '@nestjs/common';

import { ExcelPathService } from './providers/path.service';
import { ExcelColumnService } from './providers/column.service';
import { IExcelConfig } from './excel.interface';
import { ExcelService } from './excel.service';

@Module({
    providers: [ExcelService],
    exports: [ExcelService],
})
export class ExcelModule {
    static register(): DynamicModule;
    static register(config: Partial<IExcelConfig>): DynamicModule;
    static register(config?: Partial<IExcelConfig>): DynamicModule {
        config = {
            path: config?.path || '.export',
            fontFA: config?.fontFA || 'IRANYekan',
            fontEN: config?.fontEN || 'Arial',
        };

        return {
            module: ExcelModule,
            providers: [
                ExcelService,
                { provide: 'EXCEL_CONFIG', useValue: config },

                // EXTRA PROVIDERS
                ExcelColumnService,
                ExcelPathService,
            ],
            exports: [ExcelService],
        };
    }
}
