import { IsEnum } from 'class-validator'
import { LogStatusType } from '../enum/log-status-type'

export class AddlogLoginRequest {
    @IsEnum(LogStatusType, {
        message: 'status must be either success or failure',
    })
    status: LogStatusType

    email: string

    userId: string
}
