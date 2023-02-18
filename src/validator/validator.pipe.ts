import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';

import { Helper } from '@webilix/helper-library';

import { FormatsInfo } from '../formats';

import { ValidatorMessage } from './validator.message';
import { Condition } from './validator.type';
import { IDateCondition, INumberCondition, IStringCondition } from './validator.interface';

@Injectable()
export class ValidatorPipe implements PipeTransform {
    private errors: string[] = [];

    private setError(error: string): void {
        this.errors.push(error);
    }

    transform(values: { [key: string]: any }, meta: ArgumentMetadata) {
        this.errors = [];
        const conditions = Reflect.getMetadata('validator', meta.metatype || {});
        if (conditions) {
            values = this.updateValues(conditions, values);
            this.validate(conditions, values);
        }

        if (this.errors.length !== 0) throw new HttpException(this.errors, HttpStatus.BAD_REQUEST);
        return values;
    }

    private updateValues(conditions: any, values: { [key: string]: any }): { [key: string]: any } {
        const updateValue = (condition: Condition, value: any): any => {
            // DATE VALUES
            if (condition.type === 'DATE' && Helper.IS.STRING.jsonDate(value)) {
                value = Helper.STRING.changeNumbers(value, 'EN');
                if (!condition.omitConvert) value = new Date(value);
            }

            // STRING VALUES
            if (condition.type === 'STRING' && Helper.IS.string(value)) {
                if (!condition.omitTrim) value = value.trim();
                if (condition.format) value = Helper.STRING.changeNumbers(value, 'EN');
                else if (condition.changeNumbers) value = Helper.STRING.changeNumbers(value, condition.changeNumbers);
            }

            return value;
        };

        const getValue = (condition: Condition, value: any): any => {
            switch (condition.type) {
                case 'BOOLEAN':
                case 'DATE':
                case 'NUMBER':
                case 'STRING':
                    return updateValue(condition, value);

                case 'OBJECT':
                    const childs: string[] = Object.keys(condition.childs);
                    childs.forEach((child: string) => (value[child] = updateValue(condition.childs[child], value[child])));
                    return value;
            }
        };

        Object.keys(conditions).forEach((key: string) => {
            const condition: Condition = conditions[key];

            if (condition.array) {
                if (Helper.IS.array(values[key]))
                    values[key].map((_: any, index: number) => getValue(condition, values[key][index]));
            } else values[key] = getValue(condition, values[key]);
        });

        return values;
    }

    private validate(conditions: any, values: { [key: string]: any }) {
        Object.keys(conditions).forEach((key: string) => {
            const condition: Condition = conditions[key];

            if (condition.array) this.validateArray(condition, values[key]);
            else this.validateValue(condition, values[key]);
        });
    }

    private validateType(condition: Condition, value: any): boolean {
        if (condition.type !== 'BOOLEAN' && !condition.required && value === null) return true;

        switch (condition.type) {
            case 'BOOLEAN':
                return Helper.IS.boolean(value);
            case 'DATE':
                return Helper.IS.date(value) || Helper.IS.STRING.jsonDate(value);
            case 'NUMBER':
                return Helper.IS.number(value);
            case 'OBJECT':
                return Helper.IS.object(value);
            case 'STRING':
                return Helper.IS.string(value);
        }
    }

    private validateArray(condition: Condition, value: any[]): void {
        if (!condition.array) return;

        const title: string = condition.title;

        // UNDEFINED
        if (value === undefined) return this.setError(ValidatorMessage.undefined(title));

        // TYPE
        if (!Helper.IS.array(value)) return this.setError(ValidatorMessage.invalid(title));

        // COUNT && UNIQUE
        if (condition.array !== true) {
            if (condition.array.minCount && value.length < condition.array.minCount)
                return this.setError(ValidatorMessage.minCount(title, condition.array.minCount));

            if (condition.array.maxCount && value.length > condition.array.maxCount)
                return this.setError(ValidatorMessage.maxCount(title, condition.array.maxCount));

            if (
                condition.array.unique &&
                !Helper.IS.ARRAY.unique(value, condition.array.unique === true ? undefined : condition.array.unique)
            )
                return this.setError(ValidatorMessage.unique(title));
        }

        value.forEach((_: any, index: number) => this.validateValue(condition, value[index], index + 1));
    }

    private validateValue(condition: Condition, value: any, index?: number, parent?: string): void {
        const title: string = `${parent ? `${parent}: ` : ''}${condition.title}${index ? ` ${index}` : ''}`;

        // UNDEFINED
        if (value === undefined) return this.setError(ValidatorMessage.undefined(title));

        // TYPE
        if (!this.validateType(condition, value)) return this.setError(ValidatorMessage.invalid(title));

        // REQUIRED
        const isEmpty: boolean = Helper.IS.empty(value);
        if (condition.type !== 'BOOLEAN' && condition.required && isEmpty)
            return this.setError(ValidatorMessage.empty(title));
        if (isEmpty) return;

        // CONDITIONS
        switch (condition.type) {
            case 'BOOLEAN':
                return;
            case 'DATE':
                return this.validateDate(condition, title, new Date(value));
            case 'NUMBER':
                return this.validateNumber(condition, title, +value);
            case 'STRING':
                return this.validateString(condition, title, value.toString());

            case 'OBJECT':
                const childs: string[] = Object.keys(condition.childs);
                childs.forEach((child: string) =>
                    this.validateValue(condition.childs[child], value[child], undefined, title),
                );
                return;
        }
    }

    private validateDate(condition: IDateCondition, title: string, value: Date): void {
        if (condition.minDate && value.getTime() < condition.minDate.getTime())
            return this.setError(ValidatorMessage.minDate(title, condition.minDate));

        if (condition.maxDate && value.getTime() > condition.maxDate.getTime())
            return this.setError(ValidatorMessage.maxDate(title, condition.maxDate));
    }

    private validateNumber(condition: INumberCondition, title: string, value: number): void {
        if (condition.minimum && value < condition.minimum)
            return this.setError(ValidatorMessage.minimum(title, condition.minimum));

        if (condition.maximum && value > condition.maximum)
            return this.setError(ValidatorMessage.maximum(title, condition.maximum));

        if (condition.in && !condition.in.includes(value)) return this.setError(ValidatorMessage.invalid(title));
    }

    private validateString(condition: IStringCondition, title: string, value: string): void {
        if (condition.format && !FormatsInfo[condition.format].validator(value))
            return this.setError(ValidatorMessage.invalid(title));

        if (condition.in && !condition.in.includes(value)) return this.setError(ValidatorMessage.invalid(title));

        if (condition.length && value.length !== condition.length)
            return this.setError(ValidatorMessage.eqLength(title, condition.length));

        if (condition.minLength && value.length < condition.minLength)
            return this.setError(ValidatorMessage.minLength(title, condition.minLength));

        if (condition.maxLength && value.length > condition.maxLength)
            return this.setError(ValidatorMessage.maxLength(title, condition.maxLength));

        if (condition.pattern && !condition.pattern.test(value)) return this.setError(ValidatorMessage.invalid(title));
    }
}
