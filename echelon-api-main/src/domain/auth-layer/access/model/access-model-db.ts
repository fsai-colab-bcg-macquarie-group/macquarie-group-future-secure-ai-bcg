import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'
import {
    AddAccessHierarchyRequest,
    UpdateAccessHierarchyRequest,
} from '../request'

export class AccessHierarchyModelDB implements IEntityBase {
    id: number | string
    name: string
    created_at: Date
    updated_at: Date

    static fromAddAccessHierarchyRequest(
        request: AddAccessHierarchyRequest,
    ): AccessHierarchyModelDB {
        const accessModel = new AccessHierarchyModelDB()
        accessModel.name = request.name // Map the 'name' field
        accessModel.created_at = new Date() // Set the current date/time
        accessModel.updated_at = new Date() // Set the current date/time
        return accessModel
    }

    static fromUpdateAccessHierarchyRequest(
        request: UpdateAccessHierarchyRequest,
    ): AccessHierarchyModelDB {
        const accessModel = new AccessHierarchyModelDB()
        accessModel.id = request.id // Map the 'id' field
        accessModel.name = request.name // Map the 'name' field
        accessModel.updated_at = new Date() // Set the current date/time
        return accessModel
    }

    static fromDeleteAccessHierarchyRequest(
        id: number,
    ): AccessHierarchyModelDB {
        const accessModel = new AccessHierarchyModelDB()
        accessModel.id = id // Map the 'id' field
        return accessModel
    }

    static fromSelectAccessHierarchyRequest(
        id: number | string,
    ): AccessHierarchyModelDB {
        const accessModel = new AccessHierarchyModelDB()
        accessModel.id = id // Map the 'id' field
        return accessModel
    }
}
