import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'

export class SelectByEmailResponse {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    user_id: string
}
