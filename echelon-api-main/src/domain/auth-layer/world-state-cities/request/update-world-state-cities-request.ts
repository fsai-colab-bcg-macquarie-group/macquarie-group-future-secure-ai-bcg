import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateWorldStateCitiesRequest {
    @ApiProperty({
        description: 'The id type of UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsNotEmpty()
    id: string | number

    @ApiProperty({
        description: 'The name of the city',
        example: 'Sidney',
    })
    @IsNotEmpty()
    city: string

    @ApiProperty({
        description: 'The name of the state',
        example: 'NSW',
    })
    @IsNotEmpty()
    state: string

    @ApiProperty({
        description: 'The name of the country',
        example: 'Australia',
    })
    @IsNotEmpty()
    country: string
}
