import { ApiProperty } from '@nestjs/swagger'

export class SearchUserRequest {
    @ApiProperty({
        description: 'Search term to find users by name or email',
        example: 'john.doe@example.com',
        required: true,
    })
    term: string
}
