import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AddWorldStateCitiesRequest {
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
