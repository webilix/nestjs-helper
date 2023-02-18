import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class StringPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly optional?: boolean,
        private readonly validate?: { readonly length?: number; readonly minLength?: number; readonly maxLength?: number },
    ) {}

    transform(value: string): string | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));

        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(this.title));

        const length: number | undefined = this.validate?.length;
        if (length && value.length !== length) Errors.throw(Errors.eqLength(this.title, length));

        const minLength: number | undefined = this.validate?.minLength;
        if (minLength && value.length < minLength) Errors.throw(Errors.minLength(this.title, minLength));

        const maxLength: number | undefined = this.validate?.maxLength;
        if (maxLength && value.length > maxLength) Errors.throw(Errors.maxLength(this.title, maxLength));

        return value;
    }
}
