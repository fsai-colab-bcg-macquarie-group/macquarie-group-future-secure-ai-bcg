import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AuthenticationUserRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email address of the user',
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: 'password123',
        description: 'The password for authentication (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password: string
}

export class EmailRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email address of the user',
    })
    @IsEmail()
    email: string
}

export class VerifyEmailRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email address to verify',
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: false,
        description: 'Whether to include all users in the search',
        default: false,
    })
    allUsers: boolean
}

export class RefreshTokenRequest {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description:
            'The refresh token to use for generating a new access token',
    })
    @IsString()
    refreshToken: string
}
