import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class DatePipe implements PipeTransform {
    constructor(
        private readonly options?: Partial<{
            readonly title: string;
            readonly optional: boolean;
            readonly minDate: Date;
            readonly maxDate: Date;
        }>,
    ) {}

    transform(value: string | Date): Date | null {
        if (this.options?.optional && Helper.IS.empty(value)) return null;

        const title: string = this.options?.title || 'تاریخ';
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));
        if (!Helper.IS.STRING.jsonDate(value) && !Helper.IS.date(value)) Errors.throw(Errors.invalid(title));

        const date: Date = new Date(value);

        const minDate: Date | undefined = this.options?.minDate;
        if (minDate && date.getTime() < minDate.getTime()) Errors.throw(Errors.minDate(title, minDate));

        const maxDate: Date | undefined = this.options?.maxDate;
        if (maxDate && date.getTime() > maxDate.getTime()) Errors.throw(Errors.maxDate(title, maxDate));

        return date;
    }
}
