import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

@Injectable()
export class NumberPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly optional?: boolean,
        private readonly validate?: { readonly minimum?: number; readonly maximum?: number },
    ) {}

    transform(value: string | number): number | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${this.title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        if (!Helper.IS.number(value) && !Helper.IS.STRING.number(value))
            throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        const num: number = +value;
        if (!Helper.IS.number(num)) throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        const minimum: number | undefined = this.validate?.minimum;
        if (minimum && num < minimum)
            throw new HttpException(`${this.title} نمی‌تواند کمتر از ${minimum} باشد.`, HttpStatus.BAD_REQUEST);

        const maximum: number | undefined = this.validate?.maximum;
        if (maximum && num > maximum)
            throw new HttpException(`${this.title} نمی‌تواند بیشتر از ${maximum} باشد.`, HttpStatus.BAD_REQUEST);

        return num;
    }
}
