import { ApiProperty } from '@nestjs/swagger'

export class UpdatePasswordResponse {
    @ApiProperty({
        description: 'Indicates if password was successfully updated',
        example: true,
        type: Boolean,
    })
    passwordUpdate: boolean
}
