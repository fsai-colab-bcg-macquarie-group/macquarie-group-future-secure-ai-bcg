import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateAccessHierarchyRequest {
    @ApiProperty({
        description: 'The id of the access',
        example: '123',
    })
    @IsNotEmpty()
    id: string | number

    @ApiProperty({
        description: 'The name of the access',
        example: 'Administrator',
    })
    @IsNotEmpty()
    name: string
}
