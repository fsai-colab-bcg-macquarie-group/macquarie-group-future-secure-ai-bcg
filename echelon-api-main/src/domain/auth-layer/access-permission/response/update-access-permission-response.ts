import { EnumAccessHierarchyPermission } from '../enums/enum-access-permission'

export class UptadeAccessHierarchyPermissionResponse {
    id: number | string
    access_id: number | string
    permission: EnumAccessHierarchyPermission
}
