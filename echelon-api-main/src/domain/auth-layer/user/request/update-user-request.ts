import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateUserRequest {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsUUID()
    id: number | string

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: true,
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    firstName: string

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: true,
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    lastName: string

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        required: true,
    })
    email: string

    @ApiProperty({
        description: 'User priority level',
        example: 1,
        required: false,
    })
    priority?: number

    @ApiProperty({
        description: 'Access ID for user permissions',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
    })
    @IsUUID()
    accessId: string | number

    @ApiProperty({
        description: 'Location ID for user',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    locationId?: string | number

    @ApiProperty({
        description: 'Array of use case team IDs',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        required: false,
    })
    useCaseTeamIds?: string[] | number[]

    @ApiProperty({
        description: 'Deletion timestamp',
        example: '2024-03-20T12:00:00Z',
        required: false,
    })
    deletedAt?: string

    @ApiProperty({
        description: 'Ban expiration timestamp',
        example: '2024-03-20T12:00:00Z',
        required: false,
    })
    bannedUntil?: string
}
