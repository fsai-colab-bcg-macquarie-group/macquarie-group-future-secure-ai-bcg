import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'
import { AddWorkerRequest, UpdateWorkerRequest } from '../request'

export class WorkerModel implements IEntityBase {
    id: number | string
    name: string
    description: string
    created_at: Date
    updated_at: Date

    static fromAddDWorkerequest(request: AddWorkerRequest): WorkerModel {
        const workerModel = new WorkerModel()
        workerModel.name = request.name // Map the 'name' field
        workerModel.description = request.description // Map the 'name' field
        return workerModel
    }

    static fromUpdateWorkerRequest(request: UpdateWorkerRequest): WorkerModel {
        const workerModel = new WorkerModel()
        workerModel.id = request.id // Map the 'id' field
        workerModel.name = request.name // Map the 'name' field
        workerModel.description = request.description // Map the 'name' field
        workerModel.updated_at = new Date() // Set the current date/time
        return workerModel
    }

    static fromDeleteWorkerRequest(id: number | string): WorkerModel {
        const workerModel = new WorkerModel()
        workerModel.id = id // Map the 'id' field
        return workerModel
    }

    static fromSelectWorkerRequest(id: number | string): WorkerModel {
        const workerModel = new WorkerModel()
        workerModel.id = id
        return workerModel
    }
}
