import { FiltersSelectAccessHierarchyPermissionResponse } from 'src/domain/auth-layer/access-permission/response'
import {
    AddAccessHierarchyRequest,
    FiltersSelectAllAccessHierarchyRequest,
    UpdateAccessHierarchyRequest,
} from 'src/domain/auth-layer/access/request'
import {
    AddAccessHierarchyResponse,
    FilterSelectAccessHierarchyResponse,
    FiltersSelectAllAccessHierarchyResponse,
    UpdateAccessHierarchyResponse,
} from 'src/domain/auth-layer/access/response'
import { IPersistenceBase } from 'src/services/interfaces/generic/i-persistence-base'

export interface IAccessHierarchyService
    extends IPersistenceBase<
        AddAccessHierarchyRequest,
        AddAccessHierarchyResponse,
        UpdateAccessHierarchyRequest,
        UpdateAccessHierarchyResponse,
        any,
        FilterSelectAccessHierarchyResponse,
        FiltersSelectAllAccessHierarchyRequest,
        FiltersSelectAllAccessHierarchyResponse
    > {
    selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null>
    // selectAvailableAccessHierarchyById(
    //     accessId: number | string,
    // ): Promise<FilterSelectAccessHierarchyResponse[] | null>
    selectAdminAccessIds(): Promise<string[]>
}
