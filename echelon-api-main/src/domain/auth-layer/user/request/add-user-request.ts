import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { AdduserAccessHierarchyRequest } from './add-user-access-request'
import { AddUserOwnedWorkersRequest } from './add-user-owned-workers-request'
import { AddUserUseCaseTeamRequest } from './add-user-use-case-team-request'
import { Transform } from 'class-transformer'

@ApiExtraModels(
    AddUserOwnedWorkersRequest,
    AdduserAccessHierarchyRequest,
    AddUserUseCaseTeamRequest,
)
export class AddUserRequest {
    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.trim())
    firstName: string

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.trim())
    lastName: string

    @ApiProperty({
        description: 'User password',
        example: 'StrongP@ssw0rd123',
        required: false,
    })
    password?: string

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

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
    locationId?: string | number

    @ApiProperty({
        description: 'Array of use case team IDs',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        required: false,
    })
    useCaseTeamIds?: string[] | number[]

    @ApiProperty({
        description: 'Flag indicating if user uses SSO',
        example: true,
        required: false,
    })
    isSSO?: boolean

    @ApiProperty({
        description: 'SSO domain for user authentication',
        example: 'example.com',
        required: false,
    })
    ssoDomain?: string
}
