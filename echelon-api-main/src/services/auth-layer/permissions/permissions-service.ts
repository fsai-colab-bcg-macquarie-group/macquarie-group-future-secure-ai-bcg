import { PermissionsSelectAllResponse } from 'src/domain/auth-layer/permissions/response/permissions-select-all-response'
import { IPermissionsService } from 'src/domain/interfaces/services/auth-layer/permissions/i-permissions-service'
import { injectable } from 'tsyringe'

@injectable()
export class PermissionsService implements IPermissionsService {
    selectallpermissions(): Promise<PermissionsSelectAllResponse> {
        throw new Error('Method not implemented.')
    }
}
