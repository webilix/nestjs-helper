import { Formats } from '../formats';

interface ICondition {
    readonly title: string;
    readonly required?: boolean;
    readonly array?:
        | boolean
        | {
              readonly minCount?: number;
              readonly maxCount?: number;
          };
}

export interface IBooleanCondition extends Omit<ICondition, 'required'> {
    readonly type: 'BOOLEAN';
}

export interface IDateCondition extends ICondition {
    readonly type: 'DATE';
    readonly minDate?: Date;
    readonly maxDate?: Date;
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
