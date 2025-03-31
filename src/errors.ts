import { HttpException, HttpStatus } from '@nestjs/common';

import { JalaliDateTime } from '@webilix/jalali-date-time';

const getDate = JalaliDateTime().toTitle;

export class Errors {
    static throw = (error: string): void => {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    };

    static undefined = (title: string): string => `${title} مشخص نشده است.`;
    static invalid = (title: string): string => `${title} صحیح مشخص نشده است.`;
    static empty = (title: string): string => `مشخص کردن ${title} الزامی است.`;
    static unique = (title: string): string => `امکان مشخص کردن گزینه تکراری در ${title} وجود ندارد.`;

    static minimum = (title: string, value: number): string => `${title} نمی‌تواند کمتر از ${value} باشد.`;
    static maximum = (title: string, value: number): string => `${title} نمی‌تواند بیشتر از ${value} باشد.`;

    static eqLength = (title: string, value: number): string => `${title} باید ${value} کاراکتر باشد.`;
    static minLength = (title: string, value: number): string => `${title} باید حداقل دارای ${value} کاراکتر باشد.`;
    static maxLength = (title: string, value: number): string => `${title} می‌تواند حداکثر دارای ${value} کاراکتر باشد.`;

    static minDate = (title: string, value: Date): string => `${title} نمی‌تواند قبل از ${getDate(value)} باشد.`;
    static maxDate = (title: string, value: Date): string => `${title} نمی‌تواند بعد از ${getDate(value)} باشد.`;

    static minCount = (title: string, value: number): string => `تعداد ${title} باید حداقل ${value} مورد باشد.`;
    static maxCount = (title: string, value: number): string => `تعداد ${title} می‌تواند حداکثر ${value} مورد باشد.`;
}
