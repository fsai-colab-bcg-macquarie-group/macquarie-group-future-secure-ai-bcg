import { ApiProperty } from '@nestjs/swagger'

export class ConfirmationEmailRequest {
    @ApiProperty({
        description: 'Confirmation code sent to email',
        example: '123456',
    })
    code: string
}
