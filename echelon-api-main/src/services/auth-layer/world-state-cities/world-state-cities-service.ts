import { Inject, Injectable } from '@nestjs/common'
import { WorldStateCitiesModel } from 'src/domain/auth-layer/world-state-cities/model/world-state-cities-model'
import {
    AddWorldStateCitiesRequest,
    FilterSelectWorldStateCitiesRequest,
    FiltersSelectAllWorldStateCitiesRequest,
    SearchLocationRequest,
    UpdateWorldStateCitiesRequest,
} from 'src/domain/auth-layer/world-state-cities/request'
import {
    AddWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesResponse,
    FiltersSelectAllWorldStateCitiesResponse,
    UpdateWorldStateCitiesResponse,
} from 'src/domain/auth-layer/world-state-cities/response'
import { IWorldStateCitiesRepository } from 'src/domain/interfaces/repository/auth-layer/access copy/i-world-state-cities-repository'
import { IWorldStateCitiesService } from 'src/domain/interfaces/services/auth-layer/world-state-cities'

@Injectable()
export class WorldStateCitiesService implements IWorldStateCitiesService {
    constructor(
        @Inject('IWorldStateCitiesRepository')
        private readonly wscRepo: IWorldStateCitiesRepository,
    ) {}
    async search(
        param: SearchLocationRequest,
    ): Promise<FiltersSelectAllWorldStateCitiesResponse[] | null> {
        return await this.wscRepo.search(param)
    }

    async add(
        addData: AddWorldStateCitiesRequest,
    ): Promise<AddWorldStateCitiesResponse | null> {
        const wscModel =
            WorldStateCitiesModel.fromAddWorldStateCitiesRequest(addData)
        const result = await this.wscRepo.add(wscModel, 'world_states_cities')
        return result
    }

    async select(
        selectData: FilterSelectWorldStateCitiesRequest,
    ): Promise<FilterSelectWorldStateCitiesResponse | null> {
        const wscModel =
            WorldStateCitiesModel.fromSelectWorldStateCitiesRequest(
                selectData.id,
            )
        const result = await this.wscRepo.select(
            wscModel.id,
            'world_states_cities',
        )
        return result
    }

    async update(
        addData: UpdateWorldStateCitiesRequest,
    ): Promise<UpdateWorldStateCitiesResponse | null> {
        const wscModel =
            WorldStateCitiesModel.fromUpdateWorldStateCitiesRequest(addData)
        const result = await this.wscRepo.update(
            wscModel,
            'world_states_cities',
        )
        return result
    }

    async delete(id: number): Promise<string | null> {
        const wscModel =
            WorldStateCitiesModel.fromDeleteWorldStateCitiesRequest(id)
        await this.wscRepo.delete(wscModel.id, 'world_states_cities')
        return null
    }

    async selectAll(
        entity: FiltersSelectAllWorldStateCitiesRequest,
    ): Promise<FiltersSelectAllWorldStateCitiesResponse[] | null> {
        const result = this.wscRepo.selectAll(entity, 'world_states_cities')
        return result
    }
}
