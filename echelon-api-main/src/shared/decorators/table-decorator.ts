import 'reflect-metadata'

export const TABLE_NAME_METADATA = 'table_name_metadata'

export function Table(name: string): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(TABLE_NAME_METADATA, name, target)
    }
}

export function getTableName(target: Function): string | undefined {
    return Reflect.getMetadata(TABLE_NAME_METADATA, target)
}
