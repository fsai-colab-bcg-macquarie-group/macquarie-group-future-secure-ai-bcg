import { Table } from 'src/shared/decorators/table-decorator'
import { UpdateUserRequest } from '../request'
import { objectToSnake } from 'src/utils/caseConverter'

@Table('user')
export class UserModelDB {
    id: number | string
    email?: string | null
    banned_until?: string | null
    deleted_at?: string | null
    updated_at?: Date
    created_at?: Date

    static fromUpdateUserRequest(request: UpdateUserRequest): UserModelDB {
        return objectToSnake(request)
    }
}
