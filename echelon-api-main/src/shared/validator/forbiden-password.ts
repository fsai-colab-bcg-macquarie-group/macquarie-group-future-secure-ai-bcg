import {
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from 'class-validator'

const forbiddenPasswords = [
    'password123',
    'admin',
    '123456',
    'letmein',
    'welcome',
]

export function ForbiddenPassword(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ForbiddenPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, _args: ValidationArguments) {
                    return !forbiddenPasswords.includes(value.toLowerCase())
                },
            },
        })
    }
}
