import { ApiProperty } from '@nestjs/swagger'

export class AddUserOwnedWorkersRequest {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
}
