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
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IAccessHierarchyPermissionRepository
    extends IDataManagerService<
        AddAccessHierarchyPermissionRequest,
        AddAccessHierarchyPermissionResponse,
        UptadeAccessHierarchyPermissionRequest,
        UptadeAccessHierarchyPermissionResponse,
        FilterSelectAccessHierarchyPermissionResponse,
        FiltersSelectAllAccessHierarchyPermissionRequest,
        FiltersSelectAccessHierarchyPermissionResponse
    > {
    selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null>
}
