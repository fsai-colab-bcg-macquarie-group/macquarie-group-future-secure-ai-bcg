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
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IWorkerRepository
    extends IDataManagerService<
        AddWorkerRequest,
        AddWorkerResponse,
        UpdateWorkerRequest,
        UpdateWorkerResponse,
        FilterSelectWorkerResponse,
        FiltersSelectAllWorkerRequest,
        FiltersSelectAllWorkerResponse
    > {
    // change this any to specific type and database to an enum type
    selectJoin(
        { id, tableJoin, tableWhere }: any,
        database: string,
    ): Promise<FiltersSelectAllWorkerResponse[]>
}
