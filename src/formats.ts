import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

export type Formats =
    | 'BANK-CARD'
    | 'COLOR'
    | 'DATE'
    | 'DOMAIN'
    | 'EMAIL'
    | 'IP4'
    | 'MOBILE'
    | 'NATIONAL-CODE'
    | 'NUMBER'
    | 'NUMERIC'
    | 'OBJECT-ID'
    | 'PLATE'
    | 'TIME'
    | 'TIMEZONE'
    | 'URL';

export interface IFormats {
    title: string;
    validate: (value: any) => boolean;
    export?: (value: string) => string;
}

export const FormatsEnum: { [key in Formats]: IFormats } = {
    'BANK-CARD': { title: 'کارت بانکی', validate: Helper.IS.STRING.bankCard, export: Helper.STRING.getBankCardView },
    COLOR: { title: 'کد رنگ', validate: Helper.IS.STRING.color },
    DATE: { title: 'تاریخ', validate: Helper.IS.STRING.jsonDate },
    DOMAIN: { title: 'دامنه', validate: Helper.IS.STRING.domain },
    EMAIL: { title: 'ایمیل', validate: Helper.IS.STRING.email },
    IP4: { title: 'آی‌پی', validate: Helper.IS.STRING.ip4 },
    MOBILE: { title: 'موبایل', validate: Helper.IS.STRING.mobile, export: Helper.STRING.getMobileView },
    'NATIONAL-CODE': { title: 'کد ملی', validate: Helper.IS.STRING.nationalCode },
    NUMBER: { title: 'مقدار عددی', validate: Helper.IS.STRING.number },
    NUMERIC: { title: 'رشته عددی', validate: Helper.IS.STRING.numeric },
    'OBJECT-ID': { title: 'شناسه', validate: Helper.IS.STRING.objectId },
    PLATE: {
        title: 'شماره پلاک',
        validate: Helper.IS.plate,
        export: (value: string) => {
            if (!Helper.IS.plate(value)) return '';

            const [left, letter, right, iran] = value.split('-');
            return `${left} ${letter === 'ا' ? 'الف' : letter} ${right} / ایران ${iran}`;
        },
    },
    TIME: { title: 'ساعت', validate: Helper.IS.STRING.time },
    TIMEZONE: { title: 'منطقه زمانی', validate: (value: any) => JalaliDateTime().timezones().includes(value) },
    URL: { title: 'آدرس سایت', validate: Helper.IS.STRING.url },
};
