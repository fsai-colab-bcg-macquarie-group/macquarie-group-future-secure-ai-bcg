import { ApiProperty } from '@nestjs/swagger'

export class FilterSelectWorldStateCitiesResponse {
    @ApiProperty({
        description: 'Unique identifier of the access',
        example: 'uuid-example',
    })
    id: number | string

    @ApiProperty({
        description: 'Name of the access',
        example: 'Administrator',
    })
    name: string

    @ApiProperty({
        description: 'Description of the access',
        example: 'Responsible for managing system-wide configurations',
    })
    description: string

    @ApiProperty({
        description: 'Timestamp when the access was created',
        example: '2024-01-01T12:34:56Z',
    })
    createdAt: Date

    @ApiProperty({
        description: 'Timestamp when the access was last updated',
        example: '2024-01-02T14:34:56Z',
    })
    updatedAt: Date
}
