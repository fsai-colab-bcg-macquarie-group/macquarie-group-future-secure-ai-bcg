import { PermissionsSelectAllResponse } from 'src/domain/auth-layer/permissions/response/permissions-select-all-response'

export interface IPermissionsService {
    selectallpermissions(): Promise<PermissionsSelectAllResponse>
}
