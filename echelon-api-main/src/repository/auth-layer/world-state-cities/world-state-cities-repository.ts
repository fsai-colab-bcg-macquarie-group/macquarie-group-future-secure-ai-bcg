import {
    AddWorldStateCitiesRequest,
    FiltersSelectAllWorldStateCitiesRequest,
    SearchLocationRequest,
    UpdateWorldStateCitiesRequest,
} from 'src/domain/auth-layer/world-state-cities/request'
import {
    AddWorldStateCitiesResponse,
    UpdateWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesResponse,
    FiltersSelectAllWorldStateCitiesResponse,
} from 'src/domain/auth-layer/world-state-cities/response'
import { IWorldStateCitiesRepository } from 'src/domain/interfaces/repository/auth-layer/access copy/i-world-state-cities-repository'
import { BaseDataManager } from 'src/repository/base/base-data-manager'
import { throwHttpException } from 'src/utils'

export class WorldStateCitiesRepository
    extends BaseDataManager<
        AddWorldStateCitiesRequest,
        AddWorldStateCitiesResponse,
        UpdateWorldStateCitiesRequest,
        UpdateWorldStateCitiesResponse,
        FilterSelectWorldStateCitiesResponse,
        FiltersSelectAllWorldStateCitiesRequest,
        FiltersSelectAllWorldStateCitiesResponse
    >
    implements IWorldStateCitiesRepository
{
    async search(param: SearchLocationRequest): Promise<any> {
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .rpc('search_cities', {
                city_name: param.term,
            })
        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data
    }
}
