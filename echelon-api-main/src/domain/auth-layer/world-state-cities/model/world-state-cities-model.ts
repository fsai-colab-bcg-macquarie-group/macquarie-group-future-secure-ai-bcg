import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'
import {
    AddWorldStateCitiesRequest,
    UpdateWorldStateCitiesRequest,
} from '../request'

export class WorldStateCitiesModel implements IEntityBase {
    id: number | string
    city: string
    state: string
    country: string
    created_at: Date
    updated_at: Date

    static fromAddWorldStateCitiesRequest(
        request: AddWorldStateCitiesRequest,
    ): WorldStateCitiesModel {
        const worldStateCitiesModel = new WorldStateCitiesModel()
        worldStateCitiesModel.city = request.city
        worldStateCitiesModel.state = request.state
        worldStateCitiesModel.country = request.country
        worldStateCitiesModel.created_at = new Date()
        worldStateCitiesModel.updated_at = new Date()
        return worldStateCitiesModel
    }

    static fromUpdateWorldStateCitiesRequest(
        request: UpdateWorldStateCitiesRequest,
    ): WorldStateCitiesModel {
        const worldStateCitiesModel = new WorldStateCitiesModel()
        worldStateCitiesModel.id = request.id
        worldStateCitiesModel.city = request.city
        worldStateCitiesModel.state = request.state
        worldStateCitiesModel.country = request.country
        worldStateCitiesModel.updated_at = new Date()
        return worldStateCitiesModel
    }

    static fromDeleteWorldStateCitiesRequest(
        id: number,
    ): WorldStateCitiesModel {
        const worldStateCitiesModel = new WorldStateCitiesModel()
        worldStateCitiesModel.id = id
        return worldStateCitiesModel
    }

    static fromSelectWorldStateCitiesRequest(
        id: number | string,
    ): WorldStateCitiesModel {
        const worldStateCitiesModel = new WorldStateCitiesModel()
        worldStateCitiesModel.id = id
        return worldStateCitiesModel
    }
}
