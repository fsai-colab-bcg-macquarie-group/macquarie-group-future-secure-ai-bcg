import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'
import { objectToSnake } from 'src/utils/caseConverter'
import { AddUseCaseTeamRequest, UpdateUseCaseTeamRequest } from '../request'

export class UseCaseTeamModelDB implements IEntityBase {
    id: number | string
    owner_id: number | string
    name: string
    created_at: Date
    updated_at: Date

    static fromAddUseCaseTeamRequest(
        request: AddUseCaseTeamRequest,
    ): UseCaseTeamModelDB {
        return objectToSnake(request)
    }
    static fromUpdateUseCaseTeamRequest(
        request: UpdateUseCaseTeamRequest,
    ): UseCaseTeamModelDB {
        return objectToSnake(request)
    }
}
