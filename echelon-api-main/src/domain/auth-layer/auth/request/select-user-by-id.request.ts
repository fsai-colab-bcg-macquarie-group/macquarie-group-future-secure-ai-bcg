import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'
import { IsUUID } from 'class-validator'

export class SelectUserByIdRequest {
    @ApiProperty({
        description: 'User ID to select',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsUUID()
    userId: string
}
