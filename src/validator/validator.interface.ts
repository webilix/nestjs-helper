import { Formats } from '../formats';

interface ICondition {
    readonly title: string;
    readonly nullable?: boolean;
    readonly array?:
        | boolean
        | {
              readonly minCount?: number;
              readonly maxCount?: number;
              readonly unique?: true | ((value: any) => any);
          };
}

export interface IBooleanCondition extends Omit<ICondition, 'nullable'> {
    readonly type: 'BOOLEAN';
}

export interface IDateCondition extends ICondition {
    readonly type: 'DATE';
    readonly minDate?: Date;
    readonly maxDate?: Date;
    // UPDATE VALUE
    readonly omitConvert?: boolean;
}

export interface INumberCondition extends ICondition {
    readonly type: 'NUMBER';
    readonly in?: number[];
    readonly minimum?: number;
    readonly maximum?: number;
}

export interface IStringCondition extends ICondition {
    readonly type: 'STRING';
    readonly format?: Formats;
    readonly pattern?: RegExp;
    readonly in?: string[];
    readonly length?: number;
    readonly minLength?: number;
    readonly maxLength?: number;
    // UPDATE VALUE
    readonly omitTrim?: boolean;
    readonly changeNumbers?: 'EN' | 'FA';
}

export interface IObjectCondition extends ICondition {
    readonly type: 'OBJECT';
    readonly childs: {
        [key: string]:
            | Omit<IStringCondition, 'array'>
            | Omit<IBooleanCondition, 'array'>
            | Omit<IDateCondition, 'array'>
            | Omit<INumberCondition, 'array'>;
    };
}
