import { Condition } from './validator.type';

export const Validator =
    (condition: Condition): PropertyDecorator =>
    (target: { [key: string]: any }, property: string | symbol): void => {
        const args = Reflect.getMetadata('validator', target.constructor) || {};
        Object.assign(args, { [property]: condition });

        Reflect.defineMetadata('validator', args, target.constructor);
    };
