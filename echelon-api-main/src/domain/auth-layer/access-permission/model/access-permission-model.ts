import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'
import { EnumAccessHierarchyPermission } from '../enums/enum-access-permission'
import {
    AddAccessHierarchyPermissionRequest,
    UptadeAccessHierarchyPermissionRequest,
} from '../request'

export class AccessHierarchyPermissionModel implements IEntityBase {
    id: number | string
    access_id: number | string
    permission: EnumAccessHierarchyPermission
    created_at: Date
    updated_at: Date

    static fromAddAccessHierarchyPermissionRequest(
        request: AddAccessHierarchyPermissionRequest,
    ): AccessHierarchyPermissionModel {
        const accessHierarchyPermissionModel =
            new AccessHierarchyPermissionModel()
        accessHierarchyPermissionModel.access_id = request.access_id
        accessHierarchyPermissionModel.permission = request.permission
        accessHierarchyPermissionModel.created_at = new Date()
        accessHierarchyPermissionModel.updated_at = new Date()
        return accessHierarchyPermissionModel
    }

    static fromUpdateAccessHierarchyPermissionRequest(
        request: UptadeAccessHierarchyPermissionRequest,
    ): AccessHierarchyPermissionModel {
        const accessHierarchyPermissionModel =
            new AccessHierarchyPermissionModel()
        accessHierarchyPermissionModel.id = request.id
        accessHierarchyPermissionModel.access_id = request.access_id
        accessHierarchyPermissionModel.permission = request.permission
        accessHierarchyPermissionModel.updated_at = new Date()
        return accessHierarchyPermissionModel
    }

    static fromDeleteAccessHierarchyPermissionRequest(
        id: number | string,
    ): AccessHierarchyPermissionModel {
        const accessHierarchyPermissionModel =
            new AccessHierarchyPermissionModel()
        accessHierarchyPermissionModel.id = id
        return accessHierarchyPermissionModel
    }

    static fromSelectAccessHierarchyRequest(
        id: number | string,
    ): AccessHierarchyPermissionModel {
        const accessHierarchyPermissionModel =
            new AccessHierarchyPermissionModel()
        accessHierarchyPermissionModel.id = id
        return accessHierarchyPermissionModel
    }
}
