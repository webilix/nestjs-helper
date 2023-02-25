import { DynamicModule, Module } from '@nestjs/common';

import { ExportExcelService, ExportWordService } from './providers';
import { IExportConfig } from './export.interface';
import { ExportService } from './export.service';

@Module({
    providers: [ExportService, ExportExcelService, ExportWordService],
    exports: [ExportService],
})
export class ExportModule {
    static register(config?: Partial<IExportConfig>): DynamicModule {
        return {
            module: ExportModule,
            providers: [
                { provide: 'EXPORT_CONFIG', useValue: config || {} },
                ExportService,

                ExportExcelService,
                ExportWordService,
            ],
            exports: [ExportService],
        };
    }
}
