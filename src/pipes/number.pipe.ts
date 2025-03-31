import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class NumberPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly options?: Partial<{
            readonly minimum: number;
            readonly maximum: number;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string | number): number | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));
        if (!Helper.IS.number(value) && !Helper.IS.STRING.number(value)) Errors.throw(Errors.invalid(this.title));

        const num: number = +value;
        if (!Helper.IS.number(num)) Errors.throw(Errors.invalid(this.title));

        const minimum: number | undefined = this.options?.minimum;
        if (minimum && num < minimum) Errors.throw(Errors.minimum(this.title, minimum));

        const maximum: number | undefined = this.options?.maximum;
        if (maximum && num > maximum) Errors.throw(Errors.maximum(this.title, maximum));

        return num;
    }
}
