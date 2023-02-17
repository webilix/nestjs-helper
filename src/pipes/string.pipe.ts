import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

@Injectable()
export class StringPipe implements PipeTransform {
    constructor(private readonly title: string, private readonly optional?: boolean) {}

    transform(value: string): string | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${this.title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        if (Helper.IS.string(value)) return value;

        throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);
    }
}
