import { IEntityBase } from 'src/domain/interfaces/domain/i-entity-base'

export class PermissionsModel implements IEntityBase {
    id: number
    name: string
    type: string
    created_at: Date
    updated_at: Date
}
