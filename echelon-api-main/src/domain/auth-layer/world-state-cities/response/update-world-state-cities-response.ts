import { ApiProperty } from '@nestjs/swagger'

export class UpdateWorldStateCitiesResponse {
    @ApiProperty({
        description: 'The id type of UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id: string | number

    @ApiProperty({
        description: 'The name of the city',
        example: 'Sidney',
    })
    city: string

    @ApiProperty({
        description: 'The name of the state',
        example: 'NSW',
    })
    state: string

    @ApiProperty({
        description: 'The name of the country',
        example: 'Australia',
    })
    country: string
}
