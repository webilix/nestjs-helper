import { DynamicModule, Module } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { ExportCsvService, ExportExcelService, ExportPathService, ExportWordService } from './providers';
import { IExportConfig } from './export.interface';
import { ExportService } from './export.service';

@Module({})
export class ExportModule {
    static register(config?: Partial<IExportConfig>): DynamicModule {
        const getColor = (color: string | undefined, base: string): string =>
            (Helper.COLOR.toHEX(Helper.IS.STRING.color(color) ? color || base : base) || base).substring(1);

        config = {
            path: config?.path || '.export',
            fontFA: config?.fontFA || 'IRANYekan',
            fontEN: config?.fontEN || 'Arial',
            backgroundColor: getColor(config?.backgroundColor, '#1D5B74'),
            foregroundColor: getColor(config?.foregroundColor, '#FFFFFF'),
            textColor: getColor(config?.textColor, '#000000'),

            logo: config?.logo || undefined,
            gotenberg: config?.gotenberg || undefined,
        };

        return {
            module: ExportModule,
            providers: [
                { provide: 'EXPORT_CONFIG', useValue: config },
                ExportService,

                ExportCsvService,
                ExportExcelService,
                ExportPathService,
                ExportWordService,
            ],
            exports: [ExportService],
        };
    }
}
