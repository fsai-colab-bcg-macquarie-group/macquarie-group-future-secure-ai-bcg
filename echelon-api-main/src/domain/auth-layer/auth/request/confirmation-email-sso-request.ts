import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'
import { IsString } from 'class-validator'

import { IsNotEmpty } from 'class-validator'

export class ConfirmationEmailRequest {
    @ApiProperty({
        description: "Confirmation code sent to the user's email",
        example: 'abc123def456',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    code: string
}
