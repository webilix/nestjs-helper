import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class EnumPipe<T> implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly list: T[],
        private readonly options?: Partial<{
            readonly optional: boolean;
            readonly callback: (item: T) => any;
        }>,
    ) {}

    transform(value: any): T | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));

        const callback = this.options?.callback;
        const values: any[] = callback ? this.list.map((item: T) => callback(item)) : this.list;
        if (!values.includes(value)) Errors.throw(Errors.invalid(this.title));

        return callback ? (this.list.find((item: T) => callback(item) === value) ? value : null) : value;
    }
}
