import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../../errors';

type Type = 'PHRASE' | 'ALL' | 'EACH';
const typeList: Type[] = ['PHRASE', 'ALL', 'EACH'];

export interface ISearchFilter {
    readonly query: string;
    readonly type: Type;
}

@Injectable()
export class SearchFilterPipe implements PipeTransform {
    constructor(
        private readonly options?: Partial<{
            readonly title: string;
            readonly optional: boolean;
        }>,
    ) {}

    transform(value: string): ISearchFilter | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        const title: string = this.options?.title || 'عبارت جستجو';
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));
        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(title));

        const index: number = value.lastIndexOf(':');
        const query: string = value.substring(0, index).trim();
        const type: Type = value.substring(index + 1) as Type;
        if (query === '' || !typeList.includes(type)) Errors.throw(Errors.invalid(title));

        return { query, type };
    }
}
