import {
    AddWorldStateCitiesRequest,
    UpdateWorldStateCitiesRequest,
    FiltersSelectAllWorldStateCitiesRequest,
    SearchLocationRequest,
} from 'src/domain/auth-layer/world-state-cities/request'
import {
    AddWorldStateCitiesResponse,
    UpdateWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesResponse,
    FiltersSelectAllWorldStateCitiesResponse,
} from 'src/domain/auth-layer/world-state-cities/response'
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IWorldStateCitiesRepository
    extends IDataManagerService<
        AddWorldStateCitiesRequest,
        AddWorldStateCitiesResponse,
        UpdateWorldStateCitiesRequest,
        UpdateWorldStateCitiesResponse,
        FilterSelectWorldStateCitiesResponse,
        FiltersSelectAllWorldStateCitiesRequest,
        FiltersSelectAllWorldStateCitiesResponse
    > {
    search(
        param: SearchLocationRequest,
    ): Promise<FiltersSelectAllWorldStateCitiesResponse[] | null>
}
