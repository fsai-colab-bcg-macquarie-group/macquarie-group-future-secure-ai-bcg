import { IsNotEmpty, Matches } from 'class-validator'
import { ForbiddenPassword } from 'src/shared/validator'
import { ApiProperty } from '@nestjs/swagger'

export class SubordinateResetPasswordRequest {
    @ApiProperty({
        description: 'ID of the user whose password is being reset',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    userId: string

    @ApiProperty({
        description: 'New password for the user',
        example: 'StrongP4ssword',
        minLength: 8,
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
}
