import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class ItemPipe<T> implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly list: T[],
        private readonly optional?: boolean,
        private readonly callback?: (item: T) => any,
    ) {}

    transform(value: any): T | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));

        const values: any[] = this.callback ? this.list.map((item: T) => this.callback?.(item)) : this.list;
        if (!values.includes(value)) Errors.throw(Errors.invalid(this.title));

        return this.callback ? this.list.find((item: T) => this.callback?.(item) === value) : value;
    }
}
