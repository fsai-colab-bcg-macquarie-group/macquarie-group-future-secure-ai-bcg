import {
    arrayToCamel,
    objectToCamel,
    objectToSnake,
} from 'src/utils/caseConverter'

export class AccessModel {
    id: number | string
    name: string
    description: string
    createdAt: Date
    updatedAt: Date

    static fromAddAccessResponse(request: any): AccessModel {
        return objectToSnake(request)
    }

    static fromUpdateAccessResponse(request: any): AccessModel {
        return objectToCamel(request)
    }

    static fromSelectAccessResponse(request: any): AccessModel {
        return objectToCamel(request)
    }

    static fromSelectALLAccessResponse(request: any): AccessModel[] {
        return arrayToCamel(request)
    }
}
