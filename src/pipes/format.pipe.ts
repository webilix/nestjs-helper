import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';
import { Formats, FormatsEnum } from '../formats';

@Injectable()
export class FormatPipe implements PipeTransform {
    constructor(
        private readonly format: Formats,
        private readonly options?: Partial<{
            readonly title: string;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string): string | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        const title: string = this.options?.title || FormatsEnum[this.format].title;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));

        if (!FormatsEnum[this.format].validate(value)) Errors.throw(Errors.invalid(title));

        return value;
    }
}
