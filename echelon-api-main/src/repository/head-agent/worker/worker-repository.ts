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
import { IWorkerRepository } from 'src/domain/interfaces/repository/head-agent/worker/i-worker-repository'
import { BaseDataManager } from 'src/repository/base/base-data-manager'

export class WorkerRepository
    extends BaseDataManager<
        AddWorkerRequest,
        AddWorkerResponse,
        UpdateWorkerRequest,
        UpdateWorkerResponse,
        FilterSelectWorkerResponse,
        FiltersSelectAllWorkerRequest,
        FiltersSelectAllWorkerResponse
    >
    implements IWorkerRepository {}
