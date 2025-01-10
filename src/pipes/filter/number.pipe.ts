import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../../errors';

type Type = 'EQUAL' | 'GREATER' | 'LESS' | 'BETWEEN';
const typeList: Type[] = ['EQUAL', 'GREATER', 'LESS', 'BETWEEN'];

export type NumberFilter =
    | {
          readonly type: 'BETWEEN';
          readonly from: number;
          readonly to: number;
      }
    | {
          readonly type: 'EQUAL' | 'GREATER' | 'LESS';
          readonly value: number;
      };

@Injectable()
export class NumberFilterPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly options?: Partial<{
            readonly optional: boolean;
        }>,
    ) {}

    private isNumeric = (value: string): boolean => {
        if (value.substring(0, 1) === '-') value = value.substring(1);
        return Helper.IS.STRING.numeric(value);
    };

    transform(value: string): NumberFilter | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));
        if (!Helper.IS.string(value)) Errors.throw(Errors.invalid(this.title));

        const index: number = value.lastIndexOf(':');
        const query: string = value.substring(0, index).trim();
        const type: Type = value.substring(index + 1) as Type;
        if (query === '' || !typeList.includes(type)) Errors.throw(Errors.invalid(this.title));

        switch (type) {
            case 'EQUAL':
            case 'LESS':
            case 'GREATER':
                if (!this.isNumeric(query) || isNaN(+query)) Errors.throw(Errors.invalid(this.title));
                return { type, value: +query };

            case 'BETWEEN':
                const [from, to] = query.split(':', 2).map((q) => q.trim());
                if (!from || !this.isNumeric(from) || isNaN(+from) || !to || !this.isNumeric(to) || isNaN(+to))
                    Errors.throw(Errors.invalid(this.title));
                if (+from >= +to) Errors.throw(Errors.invalid(this.title));
                return { type, from: +from, to: +to };
        }
    }
}
