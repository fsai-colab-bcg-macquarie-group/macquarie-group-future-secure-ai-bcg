import { ApiProperty } from '@nestjs/swagger'

export class UpdateAccessHierarchyResponse {
    @ApiProperty({
        description: 'The id of the access',
        example: '123',
    })
    id: string

    @ApiProperty({
        description: 'The name of the access',
        example: 'Administrator',
    })
    name: string
}
