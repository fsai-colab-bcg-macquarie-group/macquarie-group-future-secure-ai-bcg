import { ApiProperty } from '@nestjs/swagger'

export class FilterSelectUserResponse {
    @ApiProperty({ description: 'User ID' })
    id: string

    @ApiProperty({ description: 'User first name' })
    firstName: string

    @ApiProperty({ description: 'User last name' })
    lastName: string

    @ApiProperty({ description: 'User email address' })
    email: string

    @ApiProperty({
        description: 'User location information',
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Location name' },
            id: { type: 'string', description: 'Location ID' },
        },
    })
    location: {
        name: string
        id: string
    }

    @ApiProperty({
        description: 'User access information',
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Access name' },
            id: { type: 'string', description: 'Access ID' },
        },
    })
    access: { name: string; id: string }

    @ApiProperty({
        description: 'User case teams',
        type: 'array',
        items: { type: 'string' },
        required: false,
    })
    useCaseTeams?: string[]

    @ApiProperty({
        description: 'User status',
        enum: ['Activated', 'Deactivated', 'Pending Activation'],
    })
    status: 'Activated' | 'Deactivated' | 'Pending Activation'

    @ApiProperty({ description: 'Whether the user is banned' })
    banned: boolean

    @ApiProperty({
        description: 'Authentication provider',
        enum: ['Email', 'SSO'],
    })
    provider: 'Email' | 'SSO'
}
