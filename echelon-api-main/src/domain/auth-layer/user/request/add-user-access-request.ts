import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator'

export class AdduserAccessHierarchyRequest {
    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    id: number
    @ApiProperty()
    @IsNotEmpty()
    name: string
}
