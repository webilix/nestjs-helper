import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Formats, FormatsInfo } from '../formats';

@Injectable()
export class FormatPipe implements PipeTransform {
    constructor(private readonly format: Formats, private readonly optional?: boolean, private readonly title?: string) {}

    transform(value: string): string | null {
        const title: string = this.title || FormatsInfo[this.format].title;

        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        if (FormatsInfo[this.format].validator(value)) return value;

        throw new HttpException(`${title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);
    }
}
