import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'

export class ResetPasswordResponse {
    @ApiProperty({
        description: 'Indicates if the password was successfully reset',
        example: true,
    })
    passwordReset: boolean

    @ApiProperty({
        description:
            'Indicates if the confirmation email was successfully sent',
        example: true,
    })
    emailSend: boolean
}
