import {
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from 'class-validator'

export function ValidatorPassword(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'Match',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints
                    const relatedValue = (args.object as any)[
                        relatedPropertyName
                    ]
                    return value === relatedValue // Returns true if the fields match
                },
            },
        })
    }
}
