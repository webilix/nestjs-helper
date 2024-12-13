import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

export interface ISearch {
    readonly query: string;
    readonly type: 'PHRASE' | 'ALL' | 'EACH';
}

@Injectable()
export class SearchPipe implements PipeTransform {
    constructor(
        private readonly options?: Partial<{
            readonly title: string;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string): ISearch | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        const title: string = this.options?.title || 'عبارت جستجو';
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));
        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(title));

        const index: number = value.lastIndexOf(':');
        const query: string = value.substring(0, index).trim();
        const type: 'PHRASE' | 'ALL' | 'EACH' = value.substring(index + 1) as 'PHRASE' | 'ALL' | 'EACH';
        if (query === '' || !['PHRASE', 'ALL', 'EACH'].includes(type)) Errors.throw(Errors.invalid(title));

        return { query, type };
    }
}
