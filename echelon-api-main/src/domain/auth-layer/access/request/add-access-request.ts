import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AddAccessHierarchyRequest {
    @ApiProperty({
        description: 'The name of the access',
        example: 'Administrator',
    })
    @IsNotEmpty()
    name: string
}
