import { HttpException, HttpStatus, Injectable, PipeTransform, Type } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Formats, FormatsInfo } from '../formats';

@Injectable()
export class ArrayPipe implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly optional?: boolean,
        private readonly validate?: {
            readonly format?: Formats;
            readonly minCount?: number;
            readonly maxCount?: number;
        },
    ) {}

    transform(value: string[]): string[] | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${this.title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        if (!Helper.IS.array(value)) throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        const format: Formats | undefined = this.validate?.format;
        if (format)
            value.forEach((v) => {
                if (!FormatsInfo[format].validator(v))
                    throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);
            });

        const minCount: number | undefined = this.validate?.minCount;
        if (minCount && value.length < minCount)
            throw new HttpException(`تعداد ${this.title} باید حداقل ${minCount} مورد باشد.`, HttpStatus.BAD_REQUEST);

        const maxCount: number | undefined = this.validate?.maxCount;
        if (maxCount && value.length > maxCount)
            throw new HttpException(`تعداد ${this.title} می‌تواند حداکثر ${maxCount} مورد باشد.`, HttpStatus.BAD_REQUEST);

        return value;
    }
}
