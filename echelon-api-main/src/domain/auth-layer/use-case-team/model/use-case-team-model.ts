import { arrayToCamel, objectToCamel } from 'src/utils/caseConverter'

export class UseCaseTeamModel {
    id: number | string
    ownerId: number | string
    name: string
    createdAt: Date
    updatedAt: Date

    static fromAddUseCaseTeamResponse(request: any): UseCaseTeamModel {
        return objectToCamel(request)
    }

    static fromUpdateUseCaseTeamResponse(request: any): UseCaseTeamModel {
        return objectToCamel(request)
    }

    static fromSelectUseCaseTeamResponse(request: any): UseCaseTeamModel {
        return objectToCamel(request)
    }

    static fromSelectALLUseCaseTeamResponse(request: any): UseCaseTeamModel[] {
        return arrayToCamel(request)
    }
}
