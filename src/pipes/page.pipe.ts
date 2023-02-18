import { Injectable, PipeTransform } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

@Injectable()
export class PagePipe implements PipeTransform {
    transform(value: string | number): number {
        if (Helper.IS.number(value)) value = value.toString();
        else if (!Helper.IS.STRING.numeric(value)) value = '1';

        const page: number = +value;
        return isNaN(page) || page < 1 ? 1 : page;
    }
}
