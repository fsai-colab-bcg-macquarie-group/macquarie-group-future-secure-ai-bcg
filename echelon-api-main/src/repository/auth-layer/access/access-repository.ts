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
import { IAccessHierarchyRepository } from 'src/domain/interfaces/repository/auth-layer/access/i-access-repository'
import { BaseDataManager } from 'src/repository/base/base-data-manager'
import { throwHttpException } from 'src/utils'

export class AccessHierarchyRepository
    extends BaseDataManager<
        AddAccessHierarchyRequest,
        AddAccessHierarchyResponse,
        UpdateAccessHierarchyRequest,
        UpdateAccessHierarchyResponse,
        FilterSelectAccessHierarchyResponse,
        FiltersSelectAllAccessHierarchyRequest,
        FiltersSelectAllAccessHierarchyResponse
    >
    implements IAccessHierarchyRepository
{
    async selectAvailableAccessHierarchy(
        accessId: string,
    ): Promise<FilterSelectAccessHierarchyResponse | null> {
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .rpc('get_access_hierarchy', {
                accessid: accessId,
            })
        if (error) {
            throwHttpException(error.message, error.code)
        }
        if (!data?.length) {
            return null
        }
        return data
    }

    async selectAdminAccessIds(): Promise<string[]> {
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .from('access')
            .select('id')
            .ilike('name', '%admin%')

        if (error) {
            throw new Error(`Database error: ${error.message}`)
        }

        return data.map((row) => row.id)
    }
}
