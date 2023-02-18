import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';

@Injectable()
export class DatePipe implements PipeTransform {
    constructor(
        private readonly title: string = 'تاریخ',
        private readonly optional?: boolean,
        private readonly validate?: { readonly minDate?: Date; readonly maxDate?: Date },
    ) {}

    transform(value: string | Date): Date | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(this.title));

        if (!Helper.IS.STRING.jsonDate(value) && !Helper.IS.date(value)) Errors.throw(Errors.invalid(this.title));

        const date: Date = new Date(value);

        const minDate: Date | undefined = this.validate?.minDate;
        if (minDate && date.getTime() < minDate.getTime()) Errors.throw(Errors.minDate(this.title, minDate));

        const maxDate: Date | undefined = this.validate?.maxDate;
        if (maxDate && date.getTime() > maxDate.getTime()) Errors.throw(Errors.maxDate(this.title, maxDate));

        return date;
    }
}
