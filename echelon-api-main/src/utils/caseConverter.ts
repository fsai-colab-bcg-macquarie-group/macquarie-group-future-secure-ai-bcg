export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function camelToSnake(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

export function objectToSnake(obj: any): any {
    return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
        acc[camelToSnake(key)] = obj[key]
        return acc
    }, {})
}

export function objectToCamel(obj: any): any {
    return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
        const value = obj[key]
        if (Array.isArray(value)) {
            acc[snakeToCamel(key)] = arrayToCamel(value)
        } else if (value !== null && typeof value === 'object') {
            acc[snakeToCamel(key)] = objectToCamel(value)
        } else {
            acc[snakeToCamel(key)] = value
        }
        return acc
    }, {})
}

export function arrayToCamel(arr: any[]): any[] {
    return arr.map((item) => objectToCamel(item))
}
