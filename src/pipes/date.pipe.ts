import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

export class DatePipe implements PipeTransform {
    constructor(
        private readonly title: string = 'تاریخ',
        private readonly optional?: boolean,
        private readonly validate?: { readonly minDate?: Date; readonly maxDate?: Date },
    ) {}

    transform(value: string | Date): Date | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${this.title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        if (!Helper.IS.STRING.jsonDate(value) && !Helper.IS.date(value))
            throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        const date: Date = new Date(value);
        const jalali = JalaliDateTime();

        const minDate: Date | undefined = this.validate?.minDate;
        if (minDate && date.getTime() < minDate.getTime())
            throw new HttpException(
                `${this.title} نمی‌تواند قبل از ${jalali.toTitle(minDate)} باشد.`,
                HttpStatus.BAD_REQUEST,
            );

        const maxDate: Date | undefined = this.validate?.maxDate;
        if (maxDate && date.getTime() > maxDate.getTime())
            throw new HttpException(
                `${this.title} نمی‌تواند بعد از ${jalali.toTitle(maxDate)} باشد.`,
                HttpStatus.BAD_REQUEST,
            );

        return date;
    }
}
