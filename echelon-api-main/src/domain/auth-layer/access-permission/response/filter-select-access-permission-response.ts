import { EnumAccessHierarchyPermission } from '../enums/enum-access-permission'

export class FilterSelectAccessHierarchyPermissionResponse {
    id: number | string
    access_id: number | string
    permission: EnumAccessHierarchyPermission
    created_at: Date
    updated_at: Date
}
