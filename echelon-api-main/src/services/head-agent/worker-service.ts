import { Inject } from '@nestjs/common'
import { WorkerModel } from 'src/domain/head-agent/model/worker-model'
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
import { IWorkerService } from '../interfaces/head-agent/i-worker-service'

export class WorkerService implements IWorkerService {
    constructor(
        @Inject('IWorkerRepository')
        private readonly workerRepo: IWorkerRepository,
    ) {}

    async add(entity: AddWorkerRequest): Promise<AddWorkerResponse | null> {
        const workerData = WorkerModel.fromAddDWorkerequest(entity)
        const result = await this.workerRepo.add(workerData, 'worker')
        return result
    }

    async update(
        entity: UpdateWorkerRequest,
    ): Promise<UpdateWorkerResponse | null> {
        const workerData = WorkerModel.fromUpdateWorkerRequest(entity)
        const result = await this.workerRepo.update(workerData, 'worker')
        return result
    }

    async delete(id: number | string): Promise<string | null> {
        const workerData = WorkerModel.fromDeleteWorkerRequest(id)
        await this.workerRepo.delete(workerData.id, 'worker')
        return null
    }

    async select(
        id: number | string,
    ): Promise<FilterSelectWorkerResponse | null> {
        const workerData = WorkerModel.fromSelectWorkerRequest(id)
        const result = await this.workerRepo.select(workerData.id, 'worker')
        return result
    }

    async selectAll(
        entity: FiltersSelectAllWorkerRequest,
    ): Promise<FiltersSelectAllWorkerResponse[] | null> {
        const result = await this.workerRepo.selectAll(entity, 'worker')
        return result
    }

    async selectAvailableWorkerByUseCaseTeamId(
        useCaseTeamId: number | string,
    ): Promise<FiltersSelectAllWorkerResponse[]> {
        const result = await this.workerRepo.selectJoin(
            {
                tableJoin: 'worker',
                tableWhere: 'use_case_team',
                id: useCaseTeamId,
            },
            'worker_use_case_team',
        )
        return result
    }
}
