import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { Helper } from '@webilix/helper-library';

import { NormalizerService } from './normalizer.service';

@Injectable()
export class NormalizerInterceptor implements NestInterceptor {
    constructor(private readonly normalizerService: NormalizerService) {}

    private normalize(body: { [key: string]: any }): { [key: string]: any } {
        Object.keys(body).forEach((key: string) => {
            const value: any = body[key];
            if (value === null) return;

            switch (true) {
                case Helper.IS.array(value) || Helper.IS.object(value):
                    this.normalize(value);
                    break;

                case Helper.IS.string(value):
                    body[key] = this.normalizerService.normalize(value);
                    break;
            }
        });

        return body;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const http = context.switchToHttp();
        const req = http.getRequest();

        const body: { [key: string]: any } = req.body;
        if (Helper.IS.object(body)) this.normalize(body);

        return next.handle();
    }
}
