import { EnumPermissionsType } from '../enums/enum-permissions-types'

export class PermissionsSelectAllResponse {
    id: number | string
    name: string
    type: EnumPermissionsType
}
