import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator'
import { User } from '@supabase/supabase-js'

export class AuthUserResponse {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string

    @ApiProperty({
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    refreshToken: string

    @ApiProperty({
        description: 'User information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            app_metadata: { provider: 'email' },
            user_metadata: { name: 'John Doe' },
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00.000Z',
            confirmed_at: '2023-01-01T00:10:00.000Z',
            email_confirmed_at: '2023-01-01T00:10:00.000Z',
            last_sign_in_at: '2023-01-01T12:00:00.000Z',
            role: 'authenticated',
            updated_at: '2023-01-01T12:00:00.000Z',
            identities: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    user_id: '123e4567-e89b-12d3-a456-426614174000',
                    identity_data: {
                        sub: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    provider: 'email',
                    created_at: '2023-01-01T00:00:00.000Z',
                    updated_at: '2023-01-01T00:00:00.000Z',
                    last_sign_in_at: '2023-01-01T12:00:00.000Z',
                },
            ],
            is_anonymous: false,
        },
    })
    user: User
}
