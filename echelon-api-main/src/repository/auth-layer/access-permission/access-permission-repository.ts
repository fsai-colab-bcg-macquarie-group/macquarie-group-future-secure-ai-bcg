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
import { IAccessHierarchyPermissionRepository } from 'src/domain/interfaces/repository/auth-layer/access-permission/i-access-permission-repository'
import { BaseDataManager } from 'src/repository/base/base-data-manager'
import { throwHttpException } from 'src/utils'

export class AccessHierarchyPermissionRepository
    extends BaseDataManager<
        AddAccessHierarchyPermissionRequest,
        AddAccessHierarchyPermissionResponse,
        UptadeAccessHierarchyPermissionRequest,
        UptadeAccessHierarchyPermissionResponse,
        FilterSelectAccessHierarchyPermissionResponse,
        FiltersSelectAllAccessHierarchyPermissionRequest,
        FiltersSelectAccessHierarchyPermissionResponse
    >
    implements IAccessHierarchyPermissionRepository
{
    async selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null> {
        this.logger.log(
            `Select all permissions by access_id: ${JSON.stringify(accessId)}`,
        )
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from('access_permission_view')
            .select('*')
            .eq('access_id', accessId)
        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data || data.length === 0) return null

        return data.map((item) => {
            return {
                accessId: item.access_id,
                accessName: item.access_name,
                accessHierarchyPermissionName: item.access_permission_name,
                permissionDescriptionName: item.permission_description_name,
            }
        })
    }
}
