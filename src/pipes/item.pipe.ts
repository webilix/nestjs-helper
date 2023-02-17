import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

export class ItemPipe<T> implements PipeTransform {
    constructor(
        private readonly title: string,
        private readonly list: T[],
        private readonly optional?: boolean,
        private readonly callback?: (item: T) => any,
    ) {}

    transform(value: any): T | null {
        if (this.optional && Helper.IS.empty(value)) return null;
        if (Helper.IS.empty(value)) throw new HttpException(`${this.title} مشخص نشده است.`, HttpStatus.BAD_REQUEST);

        const values: any[] = this.callback ? this.list.map((item: T) => this.callback?.(item)) : this.list;
        if (values.includes(value))
            return this.callback ? this.list.find((item: T) => this.callback?.(item) === value) : value;

        throw new HttpException(`${this.title} صحیح مشخص نشده است.`, HttpStatus.BAD_REQUEST);
    }
}
