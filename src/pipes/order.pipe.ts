import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

export interface IOrder {
    readonly key: string;
    readonly type: 'ASC' | 'DESC';
}

@Injectable()
export class OrderPipe implements PipeTransform {
    constructor(
        private readonly keys: string[],
        private readonly options?: Partial<{
            readonly title: string;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string): IOrder | null {
        const title: string = this.options?.title || 'ترتیب نمایش';

        if (this.options?.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));

        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(title));

        const index: number = value.lastIndexOf(':');
        const key: string = value.substring(0, index);
        const type: 'ASC' | 'DESC' = value.substring(index + 1) as 'ASC' | 'DESC';
        if (!this.keys.includes(key) || !['ASC', 'DESC'].includes(type)) Errors.throw(Errors.invalid(title));

        return { key, type };
    }
}
