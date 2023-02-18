import {
    IBooleanCondition,
    IDateCondition,
    INumberCondition,
    IObjectCondition,
    IStringCondition,
} from './validator.interface';

export type Condition = IBooleanCondition | IDateCondition | INumberCondition | IObjectCondition | IStringCondition;
