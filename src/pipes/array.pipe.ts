import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';
import { Formats, FormatsEnum } from '../formats';

@Injectable()
export class ArrayPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly optional?: boolean,
        private readonly validate?: {
            readonly format?: Formats;
            readonly minCount?: number;
            readonly maxCount?: number;
        },
    ) {}

    transform(value: string[]): string[] | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));

        if (!Helper.IS.array(value)) Errors.throw(Errors.invalid(this.title));

        const format: Formats | undefined = this.validate?.format;
        if (format)
            value.forEach((v) => {
                if (!FormatsEnum[format].validate(v)) Errors.throw(Errors.invalid(this.title));
            });

        const minCount: number | undefined = this.validate?.minCount;
        if (minCount && value.length < minCount) Errors.throw(Errors.minCount(this.title, minCount));

        const maxCount: number | undefined = this.validate?.maxCount;
        if (maxCount && value.length > maxCount) Errors.throw(Errors.maxCount(this.title, maxCount));

        return value;
    }
}
