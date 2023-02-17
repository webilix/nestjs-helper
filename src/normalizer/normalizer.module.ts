import { DynamicModule, Module } from '@nestjs/common';

import { INormalizer } from './normalizer.interface';
import { NormalizerService } from './normalizer.service';

@Module({
    providers: [NormalizerService],
    exports: [NormalizerService],
})
export class NormalizerModule {
    static register(config?: Partial<INormalizer>): DynamicModule {
        return {
            module: NormalizerModule,
            providers: [NormalizerService, { provide: 'NORMALIZER_CONFIG', useValue: config || {} }],
            exports: [NormalizerService],
        };
    }
}
