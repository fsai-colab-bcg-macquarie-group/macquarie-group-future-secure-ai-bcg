import { EnumAccessHierarchyPermission } from '../enums/enum-access-permission'

export class AddAccessHierarchyPermissionResponse {
    id: number | string
    access_id: number | string
    permission: EnumAccessHierarchyPermission
}
