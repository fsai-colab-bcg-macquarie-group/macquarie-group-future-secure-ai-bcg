import { EnumAccessHierarchyPermission } from '../enums/enum-access-permission'

export class AddAccessHierarchyPermissionRequest {
    access_id: number | string
    permission: EnumAccessHierarchyPermission
}
