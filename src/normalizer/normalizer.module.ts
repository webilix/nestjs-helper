import { DynamicModule, Module } from '@nestjs/common';

import { INormalizerConfig } from './normalizer.interface';
import { NormalizerService } from './normalizer.service';

@Module({
    providers: [NormalizerService],
    exports: [NormalizerService],
})
export class NormalizerModule {
    static register(): DynamicModule;
    static register(config: Partial<INormalizerConfig>): DynamicModule;
    static register(config?: Partial<INormalizerConfig>): DynamicModule {
        return {
            module: NormalizerModule,
            providers: [NormalizerService, { provide: 'NORMALIZER_CONFIG', useValue: config || {} }],
            exports: [NormalizerService],
        };
    }
}
