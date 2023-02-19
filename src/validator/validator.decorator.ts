import { Condition } from './validator.type';

export const Validator =
    (condition: Condition): PropertyDecorator =>
    (target: { [key: string]: any }, property: string | symbol): void => {
        const args = Reflect.getMetadata('validator', target.constructor) || {};
        Reflect.defineMetadata('validator', { ...args, [property]: condition }, target.constructor);
    };
