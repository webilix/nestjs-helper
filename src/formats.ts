import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

export type Formats =
    | 'BANK-CARD'
    | 'COLOR'
    | 'DATE'
    | 'DOMAIN'
    | 'EMAIL'
    | 'MOBILE'
    | 'NATIONAL-CODE'
    | 'NUMBER'
    | 'NUMERIC'
    | 'OBJECT-ID'
    | 'PLATE'
    | 'TIMEZONE';

export interface IFormats {
    title: string;
    validator: (value: any) => boolean;
}

export const FormatsInfo: { [key in Formats]: IFormats } = {
    'BANK-CARD': { title: 'کارت بانکی', validator: Helper.IS.STRING.bankCard },
    COLOR: { title: 'کد رنگ', validator: Helper.IS.STRING.color },
    DATE: { title: 'تاریخ', validator: Helper.IS.STRING.jsonDate },
    DOMAIN: { title: 'دامنه', validator: Helper.IS.STRING.domain },
    EMAIL: { title: 'ایمیل', validator: Helper.IS.STRING.email },
    MOBILE: { title: 'موبایل', validator: Helper.IS.STRING.mobile },
    'NATIONAL-CODE': { title: 'کد ملی', validator: Helper.IS.STRING.nationalCode },
    NUMBER: { title: 'مقدار عددی', validator: Helper.IS.STRING.number },
    NUMERIC: { title: 'رشته عددی', validator: Helper.IS.STRING.numeric },
    'OBJECT-ID': { title: 'شناسه', validator: Helper.IS.STRING.objectId },
    PLATE: { title: 'شماره پلاک', validator: Helper.IS.plate },
    TIMEZONE: { title: 'منطقه زمانی', validator: (value: any) => JalaliDateTime().timezones().includes(value) },
};
