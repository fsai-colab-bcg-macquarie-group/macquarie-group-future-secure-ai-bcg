import { IsUUID } from 'class-validator'

export class AddConfirmationEmailSSORequest {
    @IsUUID()
    userId: string
    emailConfirmedAt: string
}
