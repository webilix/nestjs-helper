import { Inject, Injectable, Optional } from '@nestjs/common';

import { INormalizerConfig } from './normalizer.interface';
import { NormalizerMap } from './normalizer.map';

@Injectable()
export class NormalizerService {
    constructor(@Optional() @Inject('NORMALIZER_CONFIG') private readonly config?: Partial<INormalizerConfig>) {}

    private update(content: string, map: { [key: string]: string }): string {
        Object.keys(map).forEach((key: string) => {
            const search: string[] = map[key].split(' ').filter((s: string) => s !== '');

            const regex: RegExp = new RegExp(`(${search.join('|')})`, 'gi');
            content = content.replace(regex, key);
        });

        return content;
    }

    private check(config1?: boolean, config2?: boolean): boolean {
        if (config1 === false || config2 === false) return false;
        return (config1 === undefined && config2 === undefined) || config1 === true || config2 === true;
    }

    public normalize(text: string): string;
    public normalize(text: string, config: Partial<INormalizerConfig>): string;
    public normalize(text: string, config?: Partial<INormalizerConfig>): string {
        // NORMALIZE
        if (this.check(this.config?.persian, config?.persian)) text = this.update(text, NormalizerMap.persian);
        if (this.check(this.config?.english, config?.english)) text = this.update(text, NormalizerMap.english);
        if (this.check(this.config?.arabic, config?.arabic)) text = this.update(text, NormalizerMap.arabic);
        if (this.check(this.config?.number, config?.number)) text = this.update(text, NormalizerMap.number);

        // WHITE SPACE
        if (this.check(this.config?.whitespace, config?.whitespace))
            while (text.indexOf('  ') !== -1) text = text.replace(/  /g, ' ');

        // TRIM
        if (this.check(this.config?.trim, config?.trim)) text = text.trim();

        return text;
    }
}
