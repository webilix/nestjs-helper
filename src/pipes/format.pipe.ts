import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { Errors } from '../errors';
import { Formats, FormatsInfo } from '../formats';

@Injectable()
export class FormatPipe implements PipeTransform {
    constructor(private readonly format: Formats, private readonly title?: string, private readonly optional?: boolean) {}

    transform(value: string): string | null {
        const title: string = this.title || FormatsInfo[this.format].title;

        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) Errors.throw(Errors.undefined(title));

        if (!FormatsInfo[this.format].validator(value)) Errors.throw(Errors.invalid(title));

        return value;
    }
}
