import { ApiProperty } from '@nestjs/swagger'

export class PersistenceAddUserResponse {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    userId: string

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        required: true,
    })
    email: string

    @ApiProperty({
        description: 'Verification code',
        example: '123456',
        required: false,
    })
    code?: string

    @ApiProperty({
        description: 'Expiration timestamp',
        example: '2024-03-20T12:00:00Z',
        required: false,
    })
    expiresAt?: string
}
