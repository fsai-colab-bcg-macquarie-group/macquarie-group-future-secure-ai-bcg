import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdateUseCaseTeamRequest {
    @IsNotEmpty()
    id: number | string

    @IsUUID()
    ownerId: number | string

    @IsString()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    name: string

    updatedAt: Date
}
