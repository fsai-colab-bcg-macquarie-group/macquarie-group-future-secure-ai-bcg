import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator'

@ApiExtraModels()
export class AddUserUseCaseTeamRequest {
    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @ApiProperty()
    id: number
    @ApiProperty()
    @IsNotEmpty()
    name: string
}
