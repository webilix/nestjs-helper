import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';
import { Formats, FormatsEnum } from '../formats';

@Injectable()
export class ArrayPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly options?: Partial<{
            readonly split: string;
            readonly format: Formats;
            readonly minCount: number;
            readonly maxCount: number;
            readonly unique: boolean;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string | string[]): string[] | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        const values = typeof value === 'string' ? value.split(this.options?.split || '||') : value;
        if (Helper.IS.empty(values)) Errors.throw(Errors.undefined(this.title));

        const format: Formats | undefined = this.options?.format;
        if (format)
            values.forEach((value) => {
                if (!FormatsEnum[format].validate(value)) Errors.throw(Errors.invalid(this.title));
            });

        const minCount: number | undefined = this.options?.minCount;
        if (minCount && values.length < minCount) Errors.throw(Errors.minCount(this.title, minCount));

        const maxCount: number | undefined = this.options?.maxCount;
        if (maxCount && values.length > maxCount) Errors.throw(Errors.maxCount(this.title, maxCount));

        const unique: boolean | undefined = this.options?.unique;
        if (unique && !Helper.IS.ARRAY.unique(values)) Errors.throw(Errors.unique(this.title));

        return values;
    }
}
