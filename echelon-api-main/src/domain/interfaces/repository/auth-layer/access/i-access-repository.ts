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
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IAccessHierarchyRepository
    extends IDataManagerService<
        AddAccessHierarchyRequest,
        AddAccessHierarchyResponse,
        UpdateAccessHierarchyRequest,
        UpdateAccessHierarchyResponse,
        FilterSelectAccessHierarchyResponse,
        FiltersSelectAllAccessHierarchyRequest,
        FiltersSelectAllAccessHierarchyResponse
    > {
    selectAvailableAccessHierarchy(
        accessId: number | string,
    ): Promise<FilterSelectAccessHierarchyResponse | null>
    selectAdminAccessIds(): Promise<string[]>
}
