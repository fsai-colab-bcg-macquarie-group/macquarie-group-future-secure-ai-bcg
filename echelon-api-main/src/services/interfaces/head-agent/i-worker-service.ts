import {
    AddWorkerRequest,
    FiltersSelectAllWorkerRequest,
    UpdateWorkerRequest,
} from 'src/domain/head-agent/request'
import {
    AddWorkerResponse,
    FilterSelectWorkerResponse,
    FiltersSelectAllWorkerResponse,
    UpdateWorkerResponse,
} from 'src/domain/head-agent/response'
import { IPersistenceBase } from '../generic/i-persistence-base'

export interface IWorkerService
    extends IPersistenceBase<
        AddWorkerRequest,
        AddWorkerResponse,
        UpdateWorkerRequest,
        UpdateWorkerResponse,
        any,
        FilterSelectWorkerResponse,
        FiltersSelectAllWorkerRequest,
        FiltersSelectAllWorkerResponse
    > {
    selectAvailableWorkerByUseCaseTeamId(
        useCaseTeamId: number | string,
    ): Promise<FiltersSelectAllWorkerResponse[]>
}
