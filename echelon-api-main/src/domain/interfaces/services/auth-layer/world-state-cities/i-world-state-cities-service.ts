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
import { IPersistenceBase } from 'src/services/interfaces/generic/i-persistence-base'

export interface IWorldStateCitiesService
    extends IPersistenceBase<
        AddWorldStateCitiesRequest,
        AddWorldStateCitiesResponse,
        UpdateWorldStateCitiesRequest,
        UpdateWorldStateCitiesResponse,
        FilterSelectWorldStateCitiesRequest,
        FilterSelectWorldStateCitiesResponse,
        FiltersSelectAllWorldStateCitiesRequest,
        FiltersSelectAllWorldStateCitiesResponse
    > {
    search(
        param: SearchLocationRequest,
    ): Promise<FiltersSelectAllWorldStateCitiesResponse[] | null>
}
