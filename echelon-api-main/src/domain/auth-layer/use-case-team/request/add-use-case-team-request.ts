import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class AddUseCaseTeamRequest {
    @IsNotEmpty()
    ownerId: number | string

    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    name: string
}
