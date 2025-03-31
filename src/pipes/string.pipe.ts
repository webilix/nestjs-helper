import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class StringPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly options?: Partial<{
            readonly length: number;
            readonly minLength: number;
            readonly maxLength: number;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string): string | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));
        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(this.title));

        const length: number | undefined = this.options?.length;
        if (length && value.length !== length) Errors.throw(Errors.eqLength(this.title, length));

        const minLength: number | undefined = this.options?.minLength;
        if (minLength && value.length < minLength) Errors.throw(Errors.minLength(this.title, minLength));

        const maxLength: number | undefined = this.options?.maxLength;
        if (maxLength && value.length > maxLength) Errors.throw(Errors.maxLength(this.title, maxLength));

        return value;
    }
}
