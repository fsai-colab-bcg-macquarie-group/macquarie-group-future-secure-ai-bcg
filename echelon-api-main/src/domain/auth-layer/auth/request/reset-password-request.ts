import { IsNotEmpty, Matches } from 'class-validator'
import { ForbiddenPassword, ValidatorPassword } from 'src/shared/validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordRequest {
    @ApiProperty({
        description: 'New password',
        example: 'StrongP4ssword',
        required: true,
    })
    @IsNotEmpty({ message: 'Password is required' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message:
            'Password must contain at least 8 characters, including an uppercase letter, a lowercase letter, and a number',
    })
    @ForbiddenPassword({
        message: 'Password is too common or easily guessable',
    })
    password: string

    @ApiProperty({
        description: 'Confirm new password (must match password)',
        example: 'StrongP4ssword',
        required: true,
    })
    @IsNotEmpty({ message: 'Confirm Password is required' })
    @ValidatorPassword('password', { message: 'Passwords do not match' })
    confirmPassword: string

    @ApiProperty({
        description: 'Access token for authentication',
        required: true,
    })
    @IsNotEmpty()
    accessToken: string

    @ApiProperty({
        description: 'Refresh token for authentication',
        required: true,
    })
    @IsNotEmpty()
    refreshToken: string
}
