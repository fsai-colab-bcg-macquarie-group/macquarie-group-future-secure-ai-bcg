import {
    AddAccessHierarchyPermissionRequest,
    FiltersSelectAllAccessHierarchyPermissionRequest,
    UptadeAccessHierarchyPermissionRequest,
} from 'src/domain/auth-layer/access-permission/request'
import {
    AddAccessHierarchyPermissionResponse,
    FilterSelectAccessHierarchyPermissionResponse,
    FiltersSelectAccessHierarchyPermissionResponse,
    UptadeAccessHierarchyPermissionResponse,
} from 'src/domain/auth-layer/access-permission/response'
import { IPersistenceBase } from 'src/services/interfaces/generic/i-persistence-base'

export interface IAccessHierarchyPermissionService
    extends IPersistenceBase<
        AddAccessHierarchyPermissionRequest,
        AddAccessHierarchyPermissionResponse,
        UptadeAccessHierarchyPermissionRequest,
        UptadeAccessHierarchyPermissionResponse,
        any,
        FilterSelectAccessHierarchyPermissionResponse,
        FiltersSelectAllAccessHierarchyPermissionRequest,
        FiltersSelectAccessHierarchyPermissionResponse
    > {
    selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null>
}
